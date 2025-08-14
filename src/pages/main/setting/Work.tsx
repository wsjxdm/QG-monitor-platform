import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, message, Collapse, Spin } from "antd";
import { getWorkDataAPI } from "../../../api/service/work";
import { getPrivateProjects } from "../../../api/service/projectoverview";
import { useParams } from "react-router-dom";

const { Title } = Typography;
const { Panel } = Collapse;

//todo
const user = JSON.parse(localStorage.getItem("user"));

// 项目信息接口
interface ProjectItem {
  uuid: number | string;
  name: string;
}

// 错误信息接口
interface ErrorItem {
  id: number | string;
  platform?: string;
  type?: string;
  timestamp?: string | number | Date;
  errorType?: string;
  message?: string;
  isHandle?: boolean;
}

const Work: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectErrors, setProjectErrors] = useState<
    Record<string, ErrorItem[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState<Record<string, boolean>>(
    {}
  );

  // 获取用户参与的项目列表
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await getPrivateProjects(user.id);
      setProjects(response);

      // 初始化每个项目的加载状态
      const loadingState: Record<string, boolean> = {};
      response.forEach((project: ProjectItem) => {
        loadingState[project.uuid as string] = false;
      });
      setProjectLoading(loadingState);
    } catch (error) {
      console.error("获取项目列表失败:", error);
      message.error("获取项目列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取特定项目中的错误数据
  const fetchProjectErrors = async (projectId: string | number) => {
    setProjectLoading((prev) => ({ ...prev, [projectId]: true }));
    try {
      const response = await getWorkDataAPI(projectId, user.id);

      if (response.length == 0) {
        setProjectErrors((prev) => ({
          ...prev,
          [projectId]: [],
        }));
        return;
      }

      const arry1 = response[0];
      const arry2 = response[1];
      const arry3 = response[2];

      let updataArry1 = [];
      let updataArry2 = [];
      let updataArry3 = [];

      if (arry1) {
        updataArry1 = arry1.map((item: any) => {
          return {
            ...item,
            platform: "backend",
            username: item.name,
          };
        });
      }

      if (arry2) {
        updataArry2 = arry2.map((item: any) => {
          return {
            ...item,
            username: item.name,
            platform: "frontend",
          };
        });
      }

      if (arry3) {
        updataArry3 = arry3.map((item: any) => {
          return {
            ...item,
            platform: "mobile",
            username: item.name,
            timestamp: new Date(item.timestamp)
              .toLocaleString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
              .replace(/\//g, "-"),
          };
        });
      }

      console.log("获取错误数据", [
        ...updataArry1,
        ...updataArry2,
        ...updataArry3,
      ]);

      // 使用已处理的数据而不是重新处理原始数据
      const processedData = [
        ...updataArry1,
        ...updataArry2,
        ...updataArry3,
      ].map((item: any) => ({
        id: item.id,
        platform: item.platform,
        type: item.type || item.errorType,
        timestamp: item.timestamp || item.timeStamp,
        errorType: item.errorType || item.type,
        message: item.message || item.errorMessage,
        // 修复 isHandle 字段的处理
        isHandle: item.isHandle !== undefined ? item.isHandle : false,
      }));

      console.log("最终处理后的错误数据:", processedData);

      setProjectErrors((prev) => ({
        ...prev,
        [projectId]: processedData,
      }));
    } catch (error) {
      console.error("获取项目错误数据失败:", error);
      message.error("获取项目错误数据失败");
    } finally {
      setProjectLoading((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // 修改表格列配置中的 isHandle 渲染
  const getColumns = (projectId: string | number) => [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "是否解决",
      dataIndex: "isHandle",
      key: "isHandle",
      width: "120px",
      render: (isHandle: boolean) => (
        <span style={{ color: isHandle ? "green" : "red" }}>
          {isHandle ? "已解决" : "未解决"}
        </span>
      ),
    },
    {
      title: "平台",
      dataIndex: "platform",
      key: "platform",
      width: 100, // 修复宽度值
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: "时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
    },
    {
      title: "错误类型",
      dataIndex: "errorType",
      key: "errorType",
      width: 150,
    },
    {
      title: "错误信息",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      width: 250,
    },
  ];

  // 跳转到错误详情页
  const goToErrorDetail = (
    projectId: string | number,
    errorId: number | string,
    platform: string
  ) => {
    navigate(`/main/project/${projectId}/detail/error/${errorId}`, {
      state: { platform },
    });
  };

  // 处理面板展开
  const handlePanelChange = (keys: string | string[]) => {
    // 当面板展开时，获取对应项目的数据
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        // 如果该项目数据还未加载，则加载数据
        if (!projectErrors[key] && !projectLoading[key]) {
          fetchProjectErrors(key);
        }
      });
    }
  };

  // 初始化数据获取
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <Title level={4}>我的任务</Title>
      {loading ? (
        <Spin tip="加载中...">
          <div style={{ height: 200 }} />
        </Spin>
      ) : (
        <Collapse
          onChange={handlePanelChange}
          accordion={false}
          style={{ width: "100%" }}
        >
          {projects.map((project) => (
            <Panel
              header={
                <div>
                  <strong>{project.name}</strong> (ID: {project.uuid})
                </div>
              }
              key={project.uuid as string}
            >
              {projectLoading[project.uuid as string] ? (
                <Spin tip="加载中...">
                  <div style={{ height: 100 }} />
                </Spin>
              ) : (
                <div>
                  {projectErrors[project.uuid as string] &&
                  projectErrors[project.uuid as string].length > 0 ? (
                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "auto",
                        width: "100%",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          overflowX: "auto",
                        }}
                      >
                        <thead>
                          <tr>
                            {getColumns(project.uuid).map((column) => (
                              <th
                                key={column.key as string}
                                style={{
                                  textAlign: "left",
                                  padding: "8px",
                                  borderBottom: "1px solid #e8e8e8",
                                  width: column.width as string,
                                }}
                              >
                                {column.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projectErrors[project.uuid as string].map(
                            (record, index) => (
                              <tr
                                key={record.id}
                                onClick={() =>
                                  goToErrorDetail(
                                    project.uuid,
                                    record.id,
                                    record.platform || "frontend"
                                  )
                                }
                                style={{
                                  cursor: "pointer",
                                  backgroundColor:
                                    index % 2 === 0 ? "#fafafa" : "#fff",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#e6f7ff")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    index % 2 === 0 ? "#fafafa" : "#fff")
                                }
                              >
                                {getColumns(project.uuid).map((column) => (
                                  <td
                                    key={column.key as string}
                                    style={{
                                      padding: "8px",
                                      borderBottom: "1px solid #e8e8e8",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {column.render
                                      ? column.render(
                                          record[
                                            column.dataIndex as keyof ErrorItem
                                          ],
                                          record
                                        )
                                      : (() => {
                                          const value =
                                            record[
                                              column.dataIndex as keyof ErrorItem
                                            ];
                                          if (value instanceof Date) {
                                            return value.toLocaleString();
                                          }
                                          return value ?? null;
                                        })()}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      该项目暂无分配给您的任务
                    </div>
                  )}
                </div>
              )}
            </Panel>
          ))}
          {projects.length === 0 && (
            <div
              style={{ padding: "24px", textAlign: "center", color: "#999" }}
            >
              暂无参与的项目
            </div>
          )}
        </Collapse>
      )}
    </div>
  );
};

export default Work;
