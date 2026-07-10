import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h2 className="text-xl font-semibold text-foreground mb-2">页面未找到</h2>
        <p className="text-muted-foreground mb-6">您访问的页面不存在或已被移除</p>
        <Button asChild>
          <Link to="/">
            <Home className="size-4 mr-2" />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
