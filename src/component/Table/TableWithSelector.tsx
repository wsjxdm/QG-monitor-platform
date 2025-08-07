// src/component/Table/TableWithSelector.tsx
import React, { useState, useEffect } from "react";
import styles from "./TableWithSelector.module.css";
import { Table, Select, Input, Button, Empty, Spin } from "antd";
import type { TableProps } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

//定义筛选项
interface FilterOption {
  label: string;
  value: string | number;
}

// 定义组件的props
interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "input";
  options?: FilterOption[];
  placeholder?: string;
}

interface TableWithSelectorProps<T> extends TableProps<T> {
  filterConfig: FilterConfig[];
  loading?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
  showResetButton?: boolean; // 是否显示重置按钮
}

const TableWithSelector = <T extends object>({
  filterConfig,
  loading = false,
  dataSource = [],
  onFilterChange,
  onRefresh,
  onRow,
  showResetButton = true,
  ...tableProps
}: TableWithSelectorProps<T>) => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setLocalLoading(loading);
  }, [loading]);

  // 处理筛选项变化
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // 重置筛选项
  const handleResetFilters = () => {
    const resetFilters: Record<string, any> = {};
    filterConfig.forEach((config) => {
      resetFilters[config.key] = config.type === "select" ? undefined : "";
    });
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  // 根据类型渲染筛选项
  const renderFilterItem = (config: FilterConfig) => {
    if (config.type === "select") {
      return (
        <Select
          key={config.key}
          style={{ maxWidth: 160 }}
          placeholder={config.placeholder || `请选择${config.label}`}
          value={filters[config.key]}
          onChange={(value) => handleFilterChange(config.key, value)}
          allowClear
          options={config.options}
        />
      );
    } else {
      return (
        <Input
          key={config.key}
          style={{ width: 160 }}
          placeholder={config.placeholder || `请输入${config.label}`}
          value={filters[config.key] || ""}
          onChange={(e) => handleFilterChange(config.key, e.target.value)}
          allowClear
        />
      );
    }
  };

  return (
    <div className={styles.container}>
      {/* 筛选栏 */}
      <div className={styles.filterBar}>
        <div className={styles.filters}>
          {filterConfig.map((config) => (
            <div key={config.key} className={styles.filterItem}>
              <span className={styles.filterLabel}>{config.label}:</span>
              {renderFilterItem(config)}
            </div>
          ))}
        </div>
        <div className={styles.actions}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            disabled={localLoading}
          >
            刷新
          </Button>
          {showResetButton && (
            <Button onClick={handleResetFilters}>重置</Button>
          )}
        </div>
      </div>

      {/* 表格区域 */}
      {/*! 能不能把Id存成key值而不展示出来*/}
      <div className={styles.tableContainer}>
        <Spin spinning={localLoading}>
          {dataSource && dataSource.length > 0 ? (
            <Table
              dataSource={dataSource}
              {...tableProps}
              onRow={onRow}
              pagination={{
                ...tableProps.pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条数据`,
              }}
            />
          ) : (
            <Empty
              description="暂无数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default TableWithSelector;
