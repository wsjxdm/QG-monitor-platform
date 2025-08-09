import React from "react";

interface Behavior {
  id: number;
  projectId: string | number;
  timeStamp: string | Date;
  sessionId?: string;
  userAgent?: string;
  breadcrumbs?: {
    category?: string;
    message?: string;
    level?: string;
    timestamp?: string;
    data: { title?: string; referer?: string };
    captureType?: string;
  }[];
  pageInfo?: {
    title: string;
    stayTime: number | string;
  };
  captureType: string;
}

const ProjectDetailBehavior: React.FC = () => {
  return (
    <div>
      <h1>项目行为</h1>
      <p>这里将展示项目的行为信息。</p>
      {/* 具体的行为展示逻辑可以在这里实现 */}
    </div>
  );
};

export default ProjectDetailBehavior;
