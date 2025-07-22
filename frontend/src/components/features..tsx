import { useState } from "react";

function TabbedContent() {
  const [activeTab, setActiveTab] = useState("marketplace");

  const tabClass = (tab: string) =>
    `px-4 py-2 rounded-full transition font-medium ${
      activeTab === tabkam
        ? "bg-violet-700 text-white"
        : "bg-gray-100 text-violet-700 hover:bg-violet-100"
    }`;

  return (
    <div className="w-full px-4 py-8 flex flex-col items-center">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button className={tabClass("marketplace")} onClick={() => setActiveTab("marketplace")}>
          🛍 Marketplace
        </button>
        <button className={tabClass("blogs")} onClick={() => setActiveTab("blogs")}>
          ✍️ Blogs
        </button>
        <button className={tabClass("video")} onClick={() => setActiveTab("video")}>
          🎥 Video Chat
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-md transition-all duration-500 ease-in-out">
        {activeTab === "marketplace" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-violet-700 mb-4">Student Marketplace</h2>
            <p className="text-gray-700">
              Buy and sell books, electronics, or notes directly with other students.
            </p>
          </div>
        )}

        {activeTab === "blogs" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-violet-700 mb-4">Student Blogs</h2>
            <p className="text-gray-700">
              Share your ideas, stories, and academic tips with your peers.
            </p>
          </div>
        )}

        {activeTab === "video" && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-violet-700 mb-4">Video Chat</h2>
            <p className="text-gray-700">
              Connect instantly with classmates or group members through secure video calls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabbedContent;
