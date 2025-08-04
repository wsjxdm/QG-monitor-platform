// 示例：ProjectDetailOverview.tsx
import { useParams } from "react-router-dom";

const ProjectDetailOverview: React.FC = () => {
  const { projectId } = useParams();

  return (
    <div>
      <h2>项目总览 - {projectId}</h2>
      <p>这里是项目 {projectId} 的总览信息</p>
    </div>
  );
};

export default ProjectDetailOverview;
