// 示例：ProjectDetailIssues.tsx
import { useParams } from "react-router-dom";

const ProjectDetailIssues: React.FC = () => {
  const { projectId } = useParams();

  return (
    <div>
      <h2>项目问题 - {projectId}</h2>
      <p>这里是项目 {projectId} 的问题列表</p>
    </div>
  );
};

export default ProjectDetailIssues;
