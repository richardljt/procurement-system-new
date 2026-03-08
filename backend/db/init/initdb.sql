-- 1. 创建用户，允许从任何 IP 连接 (% 表示任意主机)
CREATE USER 'fmrober'@'%' IDENTIFIED BY 'Lhx123!@#';

-- 2. 赋予所有数据库的全部权限
GRANT ALL PRIVILEGES ON *.* TO 'fmrober'@'%';

-- 3. 通常建议加上这个选项（带上它可以让该用户也能 GRANT 权限给别人）
--    如果你不需要这个能力，可以省略 WITH GRANT OPTION
GRANT ALL PRIVILEGES ON *.* TO 'fmrober'@'%' WITH GRANT OPTION;

-- 4. 刷新权限（非常重要！不 flush 外部经常连不上）
FLUSH PRIVILEGES;