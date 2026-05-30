diff --git a/web/src/components/ConfirmModal/ConfirmModal.tsx b/web/src/components/ConfirmModal/ConfirmModal.tsx
new file mode 100644
index 0000000..af81d01
--- /dev/null
+++ b/web/src/components/ConfirmModal/ConfirmModal.tsx
@@ -0,0 +1,79 @@
+import React, { useEffect, useRef } from 'react';
+import styles from './ConfirmModal.module.css';
+
+interface ConfirmModalProps {
+  isOpen: boolean;
+  title: string;
+  message: string;
+  onConfirm: () => void;
+  onCancel: () => void;
+  confirmText?: string;
+  cancelText?: string;
+  confirmLabel?: string;
+  cancelLabel?: string;
+  confirmDanger?: boolean;
+  type?: 'danger' | 'warning' | 'info';
+}
+
+export const ConfirmModal: React.FC<ConfirmModalProps> = ({
+  isOpen,
+  title,
+  message,
+  onConfirm,
+  onCancel,
+  confirmText = '确认',
+  cancelText = '取消',
+  confirmLabel,
+  cancelLabel,
+  confirmDanger,
+  type = 'warning',
+}) => {
+  const modalRef = useRef<HTMLDivElement>(null);
+
+  useEffect(() => {
+    if (isOpen) {
+      document.body.style.overflow = 'hidden';
+    } else {
+      document.body.style.overflow = '';
+    }
+    return () => {
+      document.body.style.overflow = '';
+    };
+  }, [isOpen]);
+
+  if (!isOpen) return null;
+
+  const handleBackdropClick = (e: React.MouseEvent) => {
+    if (e.target === e.currentTarget) {
+      onCancel();
+    }
+  };
+
+  const displayConfirmText = confirmLabel || confirmText;
+  const displayCancelText = cancelLabel || cancelText;
+  const buttonType = confirmDanger ? 'danger' : type;
+
+  return (
+    <div className={styles.backdrop} onClick={handleBackdropClick}>
+      <div className={styles.modal} ref={modalRef}>
+        <div className={styles.header}>
+          <h2 className={styles.title}>{title}</h2>
+        </div>
+        <div className={styles.body}>
+          <p className={styles.message}>{message}</p>
+        </div>
+        <div className={styles.footer}>
+          <button className={styles.cancelBtn} onClick={onCancel}>
+            {displayCancelText}
+          </button>
+          <button
+            className={`${styles.confirmBtn} ${styles[buttonType]}`}
+            onClick={onConfirm}
+          >
+            {displayConfirmText}
+          </button>
+        </div>
+      </div>
+    </div>
+  );
+};
