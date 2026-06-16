const Footer = () => (
    <footer className="site-footer">
        <div className="footer-brand">
            <div className="footer-logo">ZyScan</div>
            <p>
                Nền tảng dành cho creator, streamer và cộng đồng muốn nhận donate
                nhanh, rõ ràng và chuyên nghiệp hơn.
            </p>
        </div>

        <div className="footer-columns">
            <div>
                <h4>Sản phẩm</h4>
                <a href="/">Tính năng</a>
                <a href="/">Trang donate</a>
                <a href="/">Cập nhật mới</a>
            </div>
            <div>
                <h4>Hỗ trợ</h4>
                <a href="/">Trợ giúp</a>
                <a href="/">Liên hệ</a>
                <a href="/">Điều khoản</a>
            </div>
            <div>
                <h4>Kết nối</h4>
                <p className="footer-note">Theo dõi ZyScan để nhận thông tin và mẹo vận hành donate hiệu quả hơn.</p>
                <div className="footer-socials">
                    <span>Fb</span>
                    <span>Yt</span>
                    <span>Tk</span>
                </div>
            </div>
        </div>

        <div className="footer-copy">© 2026 ZyScan. All rights reserved.</div>
    </footer>
);

export default Footer;
