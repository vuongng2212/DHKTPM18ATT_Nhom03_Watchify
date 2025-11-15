import { Link } from "react-router-dom";
import { Button, Result } from "antd";

const ErrorPage = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Result
            status="404"
            title="404"
            subTitle="Trang bạn đang tìm kiếm không tồn tại."
            extra={
              <Link to="/">
                <Button type="primary">Quay lại trang chủ</Button>
              </Link>
            }
          />
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
