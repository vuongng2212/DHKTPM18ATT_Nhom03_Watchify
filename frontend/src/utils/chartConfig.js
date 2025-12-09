import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from 'chart.js';

// Đăng ký tất cả các thành phần Chart.js một lần duy nhất
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

export default ChartJS;