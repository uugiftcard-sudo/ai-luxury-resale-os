/**
 * 订单管理页
 * 买家查看订单状态 — all API calls include the active market.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/client';
import { useMarket } from '../hooks/useMarket';
import type { Order } from '../types';
import styles from './Orders.module.css';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  '待付款': { label: '待付款', color: '#c9a96e' },
  '待发货': { label: '待發貨', color: '#2c5282' },
  '已发货': { label: '已發貨', color: '#6b46c1' },
  '已完成': { label: '已完成', color: '#4a7c59' },
  '已取消': { label: '已取消', color: '#9e9893' },
};

export default function Orders() {
  const { market } = useMarket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    orderApi.list(market, filterStatus || undefined)
      .then(res => setOrders(res.data))
      .catch(err => setError(err instanceof Error ? err.message : '載入訂單失敗'))
      .finally(() => setLoading(false));
  }, [filterStatus, market]);

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1>
            {market === 'UK' ? 'My Orders' : '我的訂單'}
          </h1>
        </div>

        {/* 状态筛选 */}
        <div className={styles.statusTabs}>
          {['', '待付款', '待发货', '已发货', '已完成', '已取消'].map(s => (
            <button
              key={s}
              className={`${styles.tab} ${filterStatus === s ? styles.tabActive : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s ? (market === 'UK' ? s : STATUS_CONFIG[s]?.label || s) : (market === 'UK' ? 'All' : '全部')}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ margin: 'var(--space-md) 0', padding: '12px 16px', background: 'rgba(198,40,40,0.1)', border: '1.5px solid #c62828', borderRadius: 'var(--radius-md)', color: '#c62828', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : !error && orders.length === 0 ? (
          <div className="empty-state">
            <h3>
              {market === 'UK' ? 'No orders yet' : '暫無訂單'}
            </h3>
            <p>{market === 'UK' ? 'Start shopping to see your orders here.' : '開始選購心儀的奢品吧'}</p>
            <Link to={market === 'HK' ? '/hk/products' : market === 'CN' ? '/cn/products' : '/products'} className="btn btn-primary">
              {market === 'UK' ? 'Browse Now' : '去逛逛'}
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <span className={styles.orderId}>
                    {market === 'UK' ? 'Order' : '訂單號'}: {order.id}
                  </span>
                  <span
                    className={styles.statusBadge}
                    style={{ color: STATUS_CONFIG[order.status]?.color, borderColor: STATUS_CONFIG[order.status]?.color }}
                  >
                    {market === 'UK' ? order.status : STATUS_CONFIG[order.status]?.label || order.status}
                  </span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.orderInfo}>
                    <h3 className={styles.buyerName}>
                      {order.buyerInfo.name}
                    </h3>
                    <p className={styles.buyerPhone}>{order.buyerInfo.phone}</p>
                    <p className={styles.buyerAddress}>{order.buyerInfo.address}</p>
                  </div>
                  <div className={styles.orderPrice}>
                    <span className={styles.totalLabel}>
                      {market === 'UK' ? 'Total' : '實付金額'}
                    </span>
                    <span className={styles.totalPrice}>
                      ¥{order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <span>
                    {market === 'UK' ? 'Placed: ' : '下單時間: '}
                    {new Date(order.createdAt).toLocaleString(
                      market === 'UK' ? 'en-GB' : 'zh-HK',
                    )}
                  </span>
                  {order.product && (
                    <Link to={market === 'HK' ? `/hk/products/${order.productId}` : market === 'CN' ? `/cn/products/${order.productId}` : `/products/${order.productId}`} className={styles.viewProduct}>
                      {market === 'UK' ? 'View Item →' : '查看商品 →'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
