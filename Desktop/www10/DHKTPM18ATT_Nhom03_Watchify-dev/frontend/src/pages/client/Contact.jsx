import store1 from "../../assets/store1.png";
import store2 from "../../assets/store2.png";
import store3 from "../../assets/store3.png";
import store4 from "../../assets/store4.png";
import store5 from "../../assets/store5.png";

const storeLocations = [
  {
    id: 1,
    image: store1,
    address: "162 Âu Cơ, P.9, Q.Tân Bình, TP.HCM",
    phone: "1900.6777",
    email: "lienhe@tfivewatch.com",
    brands:
      "Citizen, Casio, Orient, Daniel Wellington, SR, Saga, Seiko, Fossil, OP, Candino, Skagen, Koi",
  },
  {
    id: 2,
    image: store2,
    address: "199 Âu Cơ, P.5, Q.11, TP.HCM",
    phone: "1900.6777",
    email: "lienhe@tfivewatch.com",
    brands:
      "Doxa, Longines, Frederique Constant, Rado, Citizen, Casio, Orient, Daniel Wellington, SR, Skagen",
  },
  {
    id: 3,
    image: store3,
    address: "92/2 Nguyễn Ảnh Thủ, Trung Chánh, Tân Xuân, Hóc Môn, TP.HCM",
    phone: "1900.6777",
    email: "lienhe@tfivewatch.com",
    brands:
      "Citizen, Casio, Orient, Daniel Wellington, SR, Saga, Seiko, Fossil, OP, Candino, Skagen, Koi",
  },
  {
    id: 4,
    image: store4,
    address: "676 Lê Trọng Tấn, P.Bình Hưng Hoà, Q.Bình Tân, TP.HCM",
    phone: "1900.6777",
    email: "lienhe@tfivewatch.com",
    brands:
      "Citizen, Casio, Orient, Daniel Wellington, SR, Saga, Seiko, Fossil, OP, Candino, Skagen, Koi",
  },
  {
    id: 5,
    image: store5,
    address: "468 Phan Huy Ích, Q.Tân Bình, TP.HCM",
    phone: "1900.6777",
    email: "lienhe@tfivewatch.com",
    brands:
      "Citizen, Casio, Orient, Daniel Wellington, SR, Saga, Seiko, Fossil, OP, Candino, Skagen, Koi",
  },
];

const ContactPage = () => {
  return (
    <div className="container mx-auto py-8 px-6">
      <h2 className="text-center text-xl font-bold uppercase text-gray-800 mb-6">
        HỆ THỐNG CỬA HÀNG
      </h2>

      <div className="grid grid-cols-1 gap-8">
        {storeLocations.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 p-6 flex space-x-8"
          >
            {/* Hình ảnh cửa hàng */}
            <img
              src={store.image}
              alt={`Store ${store.id}`}
              className="w-70 h-50 rounded-lg object-cover hover:opacity-90 transition duration-300"
            />

            {/* Thông tin chi tiết */}
            <div className="flex flex-col space-y-4">
              <p className="text-[#676784] font-semibold">
                Chi Nhánh:{" "}
                <span className="text-[#676767] font-normal ml-2">
                  {store.address}
                </span>
              </p>
              <p className="text-gray-600">
                <span className="text-[#676784] font-semibold mr-2">ĐT:</span>{" "}
                {store.phone}
              </p>
              <p className="text-gray-600">
                <span className="text-[#676784] font-semibold mr-2">Mail:</span>{" "}
                {store.email}
              </p>
              <p className="text-gray-700 text-sm mt-2">
                <span className="text-[#676784] font-semibold mr-2">
                  Bán Các Hãng:
                </span>{" "}
                {store.brands}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
