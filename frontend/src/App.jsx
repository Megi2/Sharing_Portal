import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import { NoticesPage, AIChatPage, KnowledgePage, QnAPage } from "./pages/subPages";

const SCREENS = ["dashboard", "notices", "aichat", "knowledge", "qna", "admin"];

export default function App() {
  const { user, setUser, logout } = useAuth();
  const [screen, setScreen] = useState("login");

  function navigate(s) {
    if (s === "__logout" || s === "login") {
      logout();
      setScreen("login");
      return;
    }
    setScreen(s);
  }

  // 로그인 화면
  if (!user || screen === "login") {
    return (
      <LoginPage onLogin={(u) => { setUser(u); setScreen("home"); }}/>
    );
  }

  // 홈 화면
  if (screen === "home") {
    return <HomePage user={user} onNavigate={navigate}/>;
  }

  // 내부 화면 (사이드바 레이아웃)
  return (
    <MainLayout user={user} screen={screen} onNavigate={navigate}>
      {screen === "dashboard" && <DashboardPage/>}
      {screen === "notices"   && <NoticesPage/>}
      {screen === "aichat"    && <AIChatPage/>}
      {screen === "knowledge" && <KnowledgePage/>}
      {screen === "qna"       && <QnAPage/>}
      {screen === "admin"     && <AdminPage/>}
    </MainLayout>
  );
}
