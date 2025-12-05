import { useState, useEffect } from 'react';
import Banner from "../../components/Banner";
import FeaturedCategory from "../../components/FeaturedCategory";
import PopularWatches from "../../components/PopularWatches";
import ProductCategories from "../../components/ProductCategory";
import SkeletonLoader from "../../components/SkeletonLoader";
import { getProductsApi } from '../../services/api';
import createInstanceAxios from '../../services/axios.customize';

const axiosCatalog = createInstanceAxios(import.meta.env.VITE_BACKEND_CATALOG_URL);

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ male: [], female: [], couple: [] });
  const [categoryIds, setCategoryIds] = useState({ male: null, female: null, couple: null });

  // Fetch category IDs on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosCatalog.get('/api/v1/categories/active');
        const allCategories = response || [];
        const mainCategories = allCategories.filter(cat => !cat.parentId);
        
        setCategoryIds({
          male: mainCategories.find(cat => cat.slug === 'dong-ho-nam')?.id,
          female: mainCategories.find(cat => cat.slug === 'dong-ho-nu')?.id,
          couple: mainCategories.find(cat => cat.slug === 'dong-ho-unisex')?.id,
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when category IDs are available
  useEffect(() => {
    if (!categoryIds.male && !categoryIds.female && !categoryIds.couple) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: 0,
          size: 10,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        };

        const [maleRes, femaleRes, coupleRes] = await Promise.all([
          categoryIds.male 
            ? getProductsApi({ ...params, categoryId: categoryIds.male })
            : Promise.resolve({ products: [] }),
          categoryIds.female
            ? getProductsApi({ ...params, categoryId: categoryIds.female })
            : Promise.resolve({ products: [] }),
          categoryIds.couple
            ? getProductsApi({ ...params, categoryId: categoryIds.couple })
            : Promise.resolve({ products: [] }),
        ]);

        setData({
          male: maleRes?.products || [],
          female: femaleRes?.products || [],
          couple: coupleRes?.products || [],
        });
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryIds]);

  return (
    <div className="container mt-4 mb-20 mx-auto pt-20">
      <Banner />
      <ProductCategories />
      <FeaturedCategory />

      {loading ? (
        <SkeletonLoader />
      ) : (
        <PopularWatches watches={data.male} title="ĐỒNG HỒ NAM MỚI NHẤT" />
      )}
      
      {loading ? (
        <SkeletonLoader />
      ) : (
        <PopularWatches watches={data.female} title="ĐỒNG HỒ NỮ MỚI NHẤT" />
      )}
      
      {loading ? (
        <SkeletonLoader />
      ) : (
        <PopularWatches watches={data.couple} title="ĐỒNG HỒ CẶP ĐÔI MỚI NHẤT" />
      )}
    </div>
  );
};

export default HomePage;