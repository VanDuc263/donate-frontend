const Footer = () => (
    <footer className="site-footer">
        <div className="footer-brand">
            <div className="footer-logo">ZyScan</div>
            <p>Nền tảng hàng đầu cho cộng đồng game thủ và người sáng tạo nội dung.</p>
        </div>

        <div className="footer-columns">
            <div>
                <h4>Sản phẩm</h4>
                <a href="/">Tính năng</a>
                <a href="/">Giá cả</a>
                <a href="/">Cập nhật</a>
            </div>
            <div>
                <h4>Hỗ trợ</h4>
                <a href="/">Trợ giúp</a>
                <a href="/">Liên hệ</a>
                <a href="/">Điều khoản</a>
            </div>
            <div>
                <h4>Kết nối</h4>
                <div className="footer-socials">
                    <span>f</span>
                    <span>▶</span>
                    <span>◌</span>
                </div>
            </div>
        </div>

        <div className="footer-copy">© Copyright 2026 ZyScan. All rights reserved.</div>
    </footer>
);

export default Footer;
