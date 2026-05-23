/**
 * Footer 组件
 * 全局底部栏
 */
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* 品牌区 */}
          <div className={styles.brand}>
            <div className={styles.logoMark}>CLOTH</div>
            <p className={styles.tagline}>
              中国领先的二手奢侈品时尚交易平台<br/>
              精选正品保障，让奢品循环新生
            </p>
            <div className={styles.socials}>
              <a href="#" aria-label="小红书" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </a>
              <a href="#" aria-label="微信" className={styles.socialIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 11c-.83 0-1.5.67-1.5 1.5S7.67 14 8.5 14s1.5-.67 1.5-1.5S9.33 11 8.5 11zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 链接 */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>商品分类</h4>
              <Link to="/products?category=包袋">包袋</Link>
              <Link to="/products?category=服饰">服饰</Link>
              <Link to="/products?category=鞋履">鞋履</Link>
              <Link to="/products?category=配饰">配饰</Link>
              <Link to="/products?category=珠宝">珠宝</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>热门品牌</h4>
              <Link to="/products?brand=Gucci">Gucci</Link>
              <Link to="/products?brand=Chanel">Chanel</Link>
              <Link to="/products?brand=Prada">Prada</Link>
              <Link to="/products?brand=Louis Vuitton">Louis Vuitton</Link>
              <Link to="/products?brand=Hermès">Hermès</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>关于 CLOTH</h4>
              <a href="#">关于我们</a>
              <a href="#">正品保障</a>
              <a href="#">交易流程</a>
              <a href="#">帮助中心</a>
              <Link to="/admin">管理后台</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} CLOTH. 让奢品循环新生</p>
          <p className={styles.legal}>本平台商品图片仅供展示，请以实物为准</p>
        </div>
      </div>
    </footer>
  );
}
