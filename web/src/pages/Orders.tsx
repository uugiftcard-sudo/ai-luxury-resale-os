/**
 * 订单管理页
 * 买家查看订单状态
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/client';
import type { Order } from '../types';
import styles from './Orders.module.css';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  '待付款': { label: '待付款', color: '#c9a96e' },
  '待发货': { label: '待发货', color: '#2c5282' },
  '已发货': { label: '已发货', color: '#6b46c1' },
  '已完成': { label: '已完成', color: '#4a7c59' },
  '已取消': { label: '已取消', color: '#9e9893' },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    orderApi.list(filterStatus || undefined)
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStatus]);

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1>我的订单</h1>
        </div>

        {/* 状态筛选 */}
        <div className={styles.statusTabs}>
          {['', '待付款', '待发货', '已发货', '已完成', '已取消'].map(s => (
            <button
              key={s}
              className={`${styles.tab} ${filterStatus === s ? styles.tabActive : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s || '全部'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>暂无订单</h3>
            <p>开始选购心仪的奢品吧</p>
            <Link to="/products" className="btn btn-primary">去逛逛</Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <span className={styles.orderId}>订单号: {order.id}</span>
                  <span
                    className={styles.statusBadge}
                    style={{ color: STATUS_CONFIG[order.status]?.color, borderColor: STATUS_CONFIG[order.status]?.color }}
                  >
                    {order.status}
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
                    <span className={styles.totalLabel}>实付金额</span>
                    <span className={styles.totalPrice}>
                      ¥{order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <span>下单时间: {new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  {order.product && (
                    <Link to={`/products/${order.productId}`} className={styles.viewProduct}>
                      查看商品 →
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
