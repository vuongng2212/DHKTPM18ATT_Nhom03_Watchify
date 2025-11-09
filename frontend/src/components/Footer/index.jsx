import cn1 from "../../assets/cn1.png";
import cn2 from "../../assets/cn2.png";
import cn3 from "../../assets/cn3.png";
import phone from "../../assets/phone.png";

const Footer = () => {
  return (
    <footer className="bg-[#A51717] text-white pt-8 pb-5">
      <div className="container mx-auto grid grid-cols-4 gap-6 px-6">
        <div>
          <div>
            <img src={phone} alt="Watchify" className="w-55" />
          </div>
          <h3 className="text-lg font-bold mt-6">CHÍNH SÁCH</h3>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <a href="#">Chính sách đổi hàng</a>
            </li>
            <li>
              <a href="#">Chính sách bảo hành</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold">HỆ THỐNG CỬA HÀNG</h3>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <a href="#">TP. Hồ Chí Minh</a>
            </li>
            <li>
              <a href="#">Hà Nội</a>
            </li>
            <li>
              <a href="#">Hải Phòng</a>
            </li>
            <li>
              <a href="#">Biên Hòa - Bình Dương</a>
            </li>
            <li>
              <a href="#">Đà Nẵng</a>
            </li>
            <li>
              <a href="#">Vũng Tàu</a>
            </li>
            <li>
              <a href="#">Cần Thơ</a>
            </li>
            <li>
              <a href="#">Trung Tâm Bảo Hành</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold">THÔNG TIN</h3>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <a href="#">Thông tin liên hệ</a>
            </li>
            <li>
              <a href="#">Liên hệ đối tác doanh nghiệp</a>
            </li>
            <li>
              <a href="#">Vận chuyển và giao nhận</a>
            </li>
          </ul>
          <h3 className="text-lg font-bold mt-10">THAM KHẢO</h3>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <a href="#">Điều khoản sử dụng</a>
            </li>
            <li>
              <a href="#">Bảo mật thông tin</a>
            </li>
            <li>
              <a href="#">Tra cứu đồng hồ bảo hành</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold">VỀ CHÚNG TÔI</h3>
          <div className="mt-6 space-y-7">
            <img src={cn1} alt="Chứng nhận 1" className="w-42" />
            <img src={cn2} alt="Chứng nhận 2" className="w-42" />
            <img src={cn3} alt="Chứng nhận 3" className="w-42" />
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-8 border-gray-500 text-[#F1F1F1] select-none">
        © All rights reserved - Bản quyền thuộc về Watchify
      </div>
    </footer>
  );
};

export default Footer;
