import { AppShell } from '@/components/layout/AppShell';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function ChatPage() {
  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <ChatContainer />
      </div>
    </AppShell>
  );
}
