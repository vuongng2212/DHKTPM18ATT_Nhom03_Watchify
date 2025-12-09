import collection from "../../assets/collection.png";
import men from "../../assets/men.png";
import women from "../../assets/women.png";
import couple from "../../assets/couple.png";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    title: "BỘ SƯU TẬP MỚI",
    image: collection,
    span: "col-span-2 row-span-2",
    route: "/couple",
  },
  {
    title: "NAM",
    image: men,
    span: "",
    route: "/men",
  },
  {
    title: "NỮ",
    image: women,
    span: "",
    route: "/women",
  },
  {
    title: "ĐỒNG HỒ ĐÔI",
    image: couple,
    span: "col-span-2",
    route: "/couple",
  },
];

const FeaturedCategory = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="container mx-auto py-8 px-40">
        <div className="grid grid-cols-4 grid-rows-2 gap-4">
          {categories.map((item, index) => (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg ${
                item.span || ""
              }`}
              onClick={() => navigate(item.route)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full transition-opacity duration-300 hover:opacity-90"
              />
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg md:text-xl">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>
      <hr className="mt-6 border-gray-300 mx-35" />
    </>
  );
};

export default FeaturedCategory;
