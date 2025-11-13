import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Users, Settings, Plus, Trash2 } from "lucide-react";

export default function FamilySettings() {
  const { user } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"parent" | "child" | "caregiver">("child");

  // Queries
  const familyQuery = trpc.family.getMyFamily.useQuery();
  const membersQuery = trpc.family.getMembers.useQuery();

  const family = familyQuery.data;
  const members = membersQuery.data || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "parent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "child":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "caregiver":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Family Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Family Info */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Family Name
              </label>
              <Input
                value={family?.name || ""}
                readOnly
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Family ID
              </label>
              <Input
                value={family?.id || ""}
                readOnly
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Created
              </label>
              <Input
                value={family?.createdAt ? new Date(family.createdAt).toLocaleDateString() : ""}
                readOnly
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Members ({members.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-3 mb-4">
                <Input
                  placeholder="Member email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <select
                  value={newMemberRole}
                  onChange={(e) =>
                    setNewMemberRole(e.target.value as "parent" | "child" | "caregiver")
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="caregiver">Caregiver</option>
                </select>
                <div className="flex gap-2">
                  <Button className="flex-1">Send Invite</Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddMember(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Members List */}
            {members.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No family members yet</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: member.color || "#3B82F6" }}
                      >
                        {member.id % 10}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          Member {member.userId}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-md mt-8">
          <CardHeader>
            <CardTitle>Family Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                <span className="text-slate-900 dark:text-white">Enable voice commands</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                <span className="text-slate-900 dark:text-white">
                  Receive daily family brief
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                <span className="text-slate-900 dark:text-white">
                  Enable push notifications
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-slate-900 dark:text-white">
                  Child-friendly mode (restrict external content)
                </span>
              </label>
            </div>
            <Button className="mt-4">Save Preferences</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
