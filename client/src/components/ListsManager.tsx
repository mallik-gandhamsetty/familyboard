import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check } from "lucide-react";

export default function ListsManager() {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"grocery" | "todo" | "shopping" | "custom">("custom");
  const [newItemText, setNewItemText] = useState("");

  // Queries
  const listsQuery = trpc.lists.getAll.useQuery();
  const itemsQuery = trpc.lists.getItems.useQuery(
    { listId: selectedListId || 0 },
    { enabled: selectedListId !== null }
  );

  // Mutations
  const createListMutation = trpc.lists.create.useMutation();
  const addItemMutation = trpc.lists.addItem.useMutation();

  const lists = listsQuery.data || [];
  const items = itemsQuery.data || [];
  const selectedList = lists.find((l) => l.id === selectedListId);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      await createListMutation.mutateAsync({
        name: newListName,
        type: newListType,
      });
      setNewListName("");
      setNewListType("custom");
      setShowNewListForm(false);
      listsQuery.refetch();
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId || !newItemText.trim()) return;

    try {
      await addItemMutation.mutateAsync({
        listId: selectedListId,
        text: newItemText,
      });
      setNewItemText("");
      itemsQuery.refetch();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const getListIcon = (type: string | null) => {
    switch (type) {
      case "grocery":
        return "🛒";
      case "todo":
        return "✓";
      case "shopping":
        return "🛍️";
      default:
        return "📝";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lists Sidebar */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Lists</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowNewListForm(!showNewListForm)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* New List Form */}
          {showNewListForm && (
            <form onSubmit={handleCreateList} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-2 mb-3">
              <Input
                placeholder="List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
              />
              <select
                value={newListType}
                onChange={(e) =>
                  setNewListType(e.target.value as "grocery" | "todo" | "shopping" | "custom")
                }
                className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="grocery">Grocery</option>
                <option value="todo">To-Do</option>
                <option value="shopping">Shopping</option>
                <option value="custom">Custom</option>
              </select>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Create
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewListForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Lists */}
          {lists.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No lists yet</p>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedListId === list.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getListIcon(list.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{list.name}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* List Items */}
      {selectedList && (
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{getListIcon(selectedList.type)}</span>
              {selectedList.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="flex gap-2">
              <Input
                placeholder="Add item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
              />
              <Button type="submit" disabled={addItemMutation.isPending}>
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Items */}
            {items.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No items in this list</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.completed
                        ? "bg-green-50 dark:bg-green-900/20 opacity-75"
                        : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                    }`}
                  >
                    <button
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? "bg-green-600 border-green-600"
                          : "border-slate-300 dark:border-slate-600 hover:border-green-600"
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          item.completed
                            ? "line-through text-slate-500 dark:text-slate-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.text}
                      </p>
                      {item.quantity && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
