import icon1 from "../../assets/dong-ho-xa-cu.png";
import icon2 from "../../assets/dong-ho-phien-ban-gioi-han.png";
import icon3 from "../../assets/dong-ho-sieu-mong.png";
import icon4 from "../../assets/dong-ho-skeleton-1.png";
import icon5 from "../../assets/dong-ho-vang-18k-1.png";
import icon6 from "../../assets/dong-ho-vat-lieu-quy-hiem.png";
import icon7 from "../../assets/day-da-hirsch.png";
import icon8 from "../../assets/dong-ho-dinh-kim-cuong.png";
import icon9 from "../../assets/kinh-hai-trieu-1.png";
import icon10 from "../../assets/vi-da.png";
import icon11 from "../../assets/day-da-dong-ho.png";
import icon12 from "../../assets/trang-suc.png";

const categories = [
  { icon: icon1, title: "Đồng hồ thời trang xà cừ" },
  { icon: icon2, title: "Phiên bản giới hạn" },
  { icon: icon3, title: "Mặt số siêu mỏng" },
  { icon: icon4, title: "Đồng hồ Skeleton siêu" },
  { icon: icon5, title: "Đồng hồ cao cấp vàng 18k" },
  { icon: icon6, title: "Đá quý - Vật liệu hiếm" },
  { icon: icon7, title: "Dây da Hirsch" },
  { icon: icon8, title: "Đính kim cương" },
  { icon: icon9, title: "Kính T Five" },
  { icon: icon10, title: "Ví da thật" },
  { icon: icon11, title: "Dây da đồng hồ" },
  { icon: icon12, title: "Trang sức" },
];

const ProductCategories = () => {
  return (
    <div className="container mx-auto pt-6 pb-8 px-35">
      <div className="grid grid-cols-6">
        {categories.map((item, index) => (
          <div key={index} className="flex flex-col items-center mt-4">
            <div
              className="bg-gray-100 p-4 rounded-lg shadow-sm flex items-center justify-center w-24 h-24 cursor-pointer mt-1 
                     transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <img src={item.icon} alt={item.title} className="w-20 h-20" />
            </div>

            <p className="text-gray-700 text-sm mt-2 text-center w-24 select-none">
              {item.title}
            </p>
          </div>
        ))}
      </div>
      <hr className="mt-6 border-gray-300" />
    </div>
  );
};

export default ProductCategories;
