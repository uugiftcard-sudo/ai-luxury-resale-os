diff --git a/web/src/pages/Admin.tsx b/web/src/pages/Admin.tsx
index a21f685..23fcc06 100644
--- a/web/src/pages/Admin.tsx
+++ b/web/src/pages/Admin.tsx
@@ -449,6 +449,7 @@ export default function Admin() {
 
       {pendingDelete && (
         <ConfirmModal
+          isOpen={true}
           title="确认下架商品"
           message={'确定要下架「' + pendingDelete.title + '」吗？下架后商品将从待售列表移除。'}
           confirmLabel="确认下架"
