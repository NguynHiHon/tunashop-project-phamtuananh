const Order = require('../models/Order');
const Product = require('../models/Product');
const Return = require('../models/Return');

const normalizeVariantId = (variantId) => (variantId ? variantId.toString() : '');
const buildItemKey = (productId, variantId) => `${productId.toString()}|${normalizeVariantId(variantId)}`;

const restoreStockForItems = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const quantity = item.quantity;

        if (product.hasVariants && item.variantId) {
            const variant = product.variants.id(item.variantId);
            if (variant) {
                variant.stock += quantity;
            }
            product.stock += quantity;
        } else {
            product.stock += quantity;
        }

        await product.save();
    }
};

const returnService = {
    async findOrderByCode(orderCode) {
        if (!orderCode) throw new Error('Vui lòng nhập mã đơn hàng');
        const order = await Order.findOne({ orderCode })
            .populate('userId', 'username email phone');
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        const returnRecords = await Return.find({ orderId: order._id }).select('items');
        const returnedQtyMap = new Map();

        returnRecords.forEach((record) => {
            (record.items || []).forEach((item) => {
                const key = buildItemKey(item.productId, item.variantId);
                const prev = returnedQtyMap.get(key) || 0;
                returnedQtyMap.set(key, prev + item.quantity);
            });
        });

        const orderObj = order.toObject();
        const remainingItems = (order.items || [])
            .map((item) => {
                const key = buildItemKey(item.productId, item.variantId);
                const returnedQty = returnedQtyMap.get(key) || 0;
                const remainingQty = Math.max(0, item.quantity - returnedQty);
                if (remainingQty <= 0) return null;
                return {
                    ...item.toObject(),
                    quantity: remainingQty,
                    subtotal: item.finalPrice * remainingQty,
                };
            })
            .filter(Boolean);

        const remainingQuantities = {};
        const returnedQuantities = {};
        (order.items || []).forEach((item) => {
            const key = buildItemKey(item.productId, item.variantId);
            const returnedQty = returnedQtyMap.get(key) || 0;
            const remainingQty = Math.max(0, item.quantity - returnedQty);
            remainingQuantities[key] = remainingQty;
            returnedQuantities[key] = returnedQty;
        });

        if (returnRecords.length > 0 && remainingItems.length === 0) {
            throw new Error('Đơn hàng đã hoàn hết số lượng');
        }

        return {
            ...orderObj,
            items: orderObj.items,
            originalItems: orderObj.items,
            remainingItems,
            remainingQuantities,
            returnedQuantities,
            hasPreviousReturns: returnRecords.length > 0,
        };
    },

    async createReturn({ orderCode, items, note, reason, processedBy }) {
        if (!orderCode) throw new Error('Vui lòng nhập mã đơn hàng');
        if (!items || items.length === 0) throw new Error('Vui lòng chọn sản phẩm trả hàng');

        const order = await Order.findOne({ orderCode });
        if (!order) throw new Error('Không tìm thấy đơn hàng');

        if (!['delivered', 'returned'].includes(order.status)) {
            throw new Error('Chỉ có thể hoàn hàng với đơn đã giao thành công');
        }

        const orderItemIndex = new Map();
        order.items.forEach((item) => {
            const key = buildItemKey(item.productId, item.variantId);
            orderItemIndex.set(key, item);
        });

        const previousReturns = await Return.find({ orderId: order._id }).select('items');
        const returnedQtyMap = new Map();
        previousReturns.forEach((record) => {
            (record.items || []).forEach((item) => {
                const key = buildItemKey(item.productId, item.variantId);
                const prev = returnedQtyMap.get(key) || 0;
                returnedQtyMap.set(key, prev + item.quantity);
            });
        });

        let refundAmount = 0;
        const returnItems = items.map((item) => {
            const key = buildItemKey(item.productId, item.variantId);
            const orderItem = orderItemIndex.get(key);
            if (!orderItem) {
                throw new Error('Sản phẩm không tồn tại trong đơn hàng');
            }

            const quantity = Number(item.quantity) || 0;
            const returnedQty = returnedQtyMap.get(key) || 0;
            const remainingQty = orderItem.quantity - returnedQty;
            if (quantity <= 0 || quantity > remainingQty) {
                throw new Error('Số lượng trả hàng không hợp lệ');
            }

            const unitPrice = orderItem.finalPrice;
            const total = unitPrice * quantity;
            refundAmount += total;

            return {
                productId: orderItem.productId,
                variantId: orderItem.variantId || null,
                variantInfo: orderItem.variantInfo,
                productName: orderItem.productName,
                quantity,
                unitPrice,
                total,
            };
        });

        const returnRecord = await Return.create({
            orderId: order._id,
            orderCode: order.orderCode,
            customerId: order.userId,
            items: returnItems,
            refundAmount: Math.round(refundAmount),
            processedBy,
            reason,
            note,
        });

        order.status = 'returned';
        order.statusHistory.push({
            status: 'returned',
            changedAt: new Date(),
            changedBy: processedBy,
            note: note || 'Xác nhận hoàn hàng',
        });
        await order.save();

        await restoreStockForItems(returnItems);

        return returnRecord;
    },

    async listReturns({ page = 1, limit = 20, search } = {}) {
        const query = {};
        if (search) {
            query.$or = [
                { orderCode: { $regex: search, $options: 'i' } },
            ];
        }

        const items = await Return.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('processedBy', 'username role')
            .populate('customerId', 'username email phone');

        const total = await Return.countDocuments(query);

        return {
            data: items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getReturnById(id) {
        const record = await Return.findById(id)
            .populate('processedBy', 'username role')
            .populate('customerId', 'username email phone');
        if (!record) throw new Error('Không tìm thấy yêu cầu hoàn hàng');
        return record;
    },
};

module.exports = returnService;
