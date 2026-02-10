import axios from 'axios';

// Using provinces.open-api.vn for Vietnam address data
const PROVINCES_API = 'https://provinces.open-api.vn/api';

// Get all provinces
export const getProvinces = async () => {
    try {
        const response = await axios.get(`${PROVINCES_API}/p/`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch provinces:', error);
        return [];
    }
};

// Get districts by province code
export const getDistricts = async (provinceCode) => {
    try {
        const response = await axios.get(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
        return response.data?.districts || [];
    } catch (error) {
        console.error('Failed to fetch districts:', error);
        return [];
    }
};

// Get wards by district code
export const getWards = async (districtCode) => {
    try {
        const response = await axios.get(`${PROVINCES_API}/d/${districtCode}?depth=2`);
        return response.data?.wards || [];
    } catch (error) {
        console.error('Failed to fetch wards:', error);
        return [];
    }
};

// Format full address
export const formatFullAddress = (address) => {
    if (!address) return '';
    const parts = [];
    if (address.addressDetail) parts.push(address.addressDetail);
    // Support both flat and nested structure
    if (address.wardName) parts.push(address.wardName);
    else if (address.ward?.name) parts.push(address.ward.name);
    if (address.districtName) parts.push(address.districtName);
    else if (address.district?.name) parts.push(address.district.name);
    if (address.provinceName) parts.push(address.provinceName);
    else if (address.province?.name) parts.push(address.province.name);
    return parts.join(', ');
};
