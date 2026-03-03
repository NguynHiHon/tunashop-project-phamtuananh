const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const Image = require('../models/Image');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// Gọi Gemini, nếu lỗi location/unavailable thì fallback sang Groq
const callAIWithFallback = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });
        return response.text;
    } catch (geminiError) {
        const status = geminiError?.status;
        // Fallback khi Gemini bị block IP (400) hoặc quá tải (503)
        if (status === 400 || status === 503 || status === 429) {
            console.warn(`Gemini thất bại (${status}), chuyển sang Groq AI...`);
            const groqResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            });
            return groqResponse.choices[0].message.content;
        }
        throw geminiError; // Lỗi khác thì vẫn throw
    }
};

const getAdvisorRecommendation = async (req, res) => {
    try {
        const {
            budget,         // { min: 0, max: 5000000 }
            brand,          // e.g. "Lining" | "" (all)
            productType,    // productType _id or "" (all)
            description,    // free-text from user
        } = req.body;

        // --- 1. Lấy sản phẩm từ DB theo bộ lọc ---
        const query = {};
        if (brand && brand !== 'all') {
            query.brand = { $regex: brand, $options: 'i' };
        }
        if (productType && productType !== 'all') {
            query.productTypeId = productType;
        }
        if (budget?.max) {
            query.price = { $lte: Number(budget.max) };
        }
        if (budget?.min) {
            query.price = { ...query.price, $gte: Number(budget.min) };
        }

        const products = await Product.find(query)
            .populate('productTypeId', 'name_vi name')
            .select('name brand price salePercent description productTypeId defaultImageId')
            .limit(40)
            .lean();

        // --- 2. Format danh sách sản phẩm gửi cho AI (kèm _id) ---
        const productList = products.length > 0
            ? products.map((p, i) => {
                const finalPrice = p.salePercent > 0
                    ? Math.round(p.price * (1 - p.salePercent / 100))
                    : p.price;
                const typeName = p.productTypeId?.name_vi || p.productTypeId?.name || 'Sản phẩm';
                return `${i + 1}. ID:${p._id} | [${typeName}] ${p.name} (${p.brand || 'N/A'}) - ${finalPrice.toLocaleString('vi-VN')}đ${p.salePercent > 0 ? ` (-${p.salePercent}%)` : ''}${p.description ? ` — ${p.description.substring(0, 80)}` : ''}`;
            }).join('\n')
            : 'Không có sản phẩm phù hợp trong kho.';

        // --- 3. Lấy tên loại sản phẩm đang lọc ---
        let productTypeName = 'tất cả sản phẩm thể thao';
        if (productType && productType !== 'all') {
            const pt = await ProductType.findById(productType).select('name_vi name').lean();
            if (pt) productTypeName = pt.name_vi || pt.name;
        }

        // --- 4. Build prompt --- yêu cầu AI trả về JSON ---
        const prompt = `Bạn là chuyên gia tư vấn sản phẩm thể thao tại cửa hàng TunaShop.
Hãy phân tích yêu cầu của khách hàng và gợi ý sản phẩm phù hợp nhất từ danh sách sản phẩm thực tế dưới đây.

**THÔNG TIN KHÁCH HÀNG:**
- Danh mục quan tâm: ${productTypeName}
- Ngân sách: ${budget?.min ? Number(budget.min).toLocaleString('vi-VN') + 'đ' : '0đ'} – ${budget?.max ? Number(budget.max).toLocaleString('vi-VN') + 'đ' : 'không giới hạn'}
- Thương hiệu yêu thích: ${brand && brand !== 'all' ? brand : 'Không có ưu tiên'}
- Mô tả yêu cầu của khách: "${description || 'Không có mô tả thêm'}"

**DANH SÁCH SẢN PHẨM HIỆN CÓ TẠI SHOP (mỗi dòng có ID sản phẩm):**
${productList}

**QUAN TRỌNG — PHẠM VI TƯ VẤN:**
- Chỉ tư vấn về việc chọn SẢN PHẨM NÀO phù hợp (thương hiệu, model, đặc tính kỹ thuật, phong cách)
- TUYỆT ĐỐI KHÔNG tư vấn về size, số, kích cỡ
- Gợi ý tối đa 3 sản phẩm

**YÊU CẦU ĐỊNH DẠNG TRẢ LỜI — BẮT BUỘC trả về JSON hợp lệ:**
{
  "recommendation": "Nội dung tư vấn chi tiết bằng tiếng Việt, thân thiện, dùng emoji phù hợp. Giải thích lý do chọn từng sản phẩm. Không đề cập đến size.",
  "recommendedProductIds": ["id1", "id2", "id3"]
}

Chỉ trả về JSON, không thêm bất kỳ text nào bên ngoài JSON.`;

        // --- 5. Gọi AI (Gemini trước, fallback Groq nếu lỗi) ---
        let text = await callAIWithFallback(prompt);

        // --- 6. Parse JSON từ AI ---
        let recommendation = '';
        let recommendedProductIds = [];

        try {
            // Remove markdown code block if present
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
            const parsed = JSON.parse(jsonStr);
            recommendation = parsed.recommendation || text;
            recommendedProductIds = parsed.recommendedProductIds || [];
        } catch {
            // Fallback: AI không trả JSON đúng format
            recommendation = text;
            recommendedProductIds = [];
        }

        // --- 7. Fetch thông tin đầy đủ cho các sản phẩm được gợi ý ---
        let recommendedProducts = [];
        if (recommendedProductIds.length > 0) {
            const validIds = recommendedProductIds.filter(id => id && id.length === 24);
            const dbProducts = await Product.find({ _id: { $in: validIds } })
                .populate('productTypeId', 'name_vi name')
                .select('name brand price salePercent defaultImageId productTypeId')
                .lean();

            // Fetch ảnh cho từng sản phẩm
            const imageIds = dbProducts.map(p => p.defaultImageId).filter(Boolean);
            const images = await Image.find({ _id: { $in: imageIds } }).lean();
            const imageMap = {};
            images.forEach(img => { imageMap[img._id.toString()] = img.url_Image; });

            recommendedProducts = dbProducts.map(p => {
                const finalPrice = p.salePercent > 0
                    ? Math.round(p.price * (1 - p.salePercent / 100))
                    : p.price;
                return {
                    _id: p._id,
                    name: p.name,
                    brand: p.brand,
                    price: p.price,
                    finalPrice,
                    salePercent: p.salePercent,
                    productType: p.productTypeId?.name_vi || p.productTypeId?.name || '',
                    imageUrl: p.defaultImageId ? imageMap[p.defaultImageId.toString()] : null,
                };
            });

            // Giữ thứ tự AI gợi ý
            recommendedProducts.sort((a, b) =>
                validIds.indexOf(a._id.toString()) - validIds.indexOf(b._id.toString())
            );
        }

        return res.status(200).json({
            status: 'success',
            recommendation,
            products: recommendedProducts,
        });

    } catch (error) {
        console.error('AI Advisor error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Không thể kết nối AI lúc này. Vui lòng thử lại sau.',
        });
    }
};

module.exports = { getAdvisorRecommendation };
