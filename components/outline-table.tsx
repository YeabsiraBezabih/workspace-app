"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, GripVertical, Copy, Settings2, CheckCircle2, Loader2, Clock } from "lucide-react";
import { useActiveOrganization } from "@/lib/auth-client";
import { OutlineSheet } from "@/components/outline-sheet";
import { Badge } from "@/components/ui/badge";
import { InlineEditableCell } from "@/components/inline-editable-cell";

interface Outline {
  id: string;
  header: string;
  sectionType: string;
  status: string;
  target: number;
  limit: number;
  reviewer: string;
  updatedAt: string;
}

function SortableRow({
  outline,
  selected,
  visibleColumns,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdate,
}: {
  outline: Outline;
  selected: boolean;
  visibleColumns: any;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (outline: Outline) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, value: string | number) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: outline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFieldUpdate = async (field: string, value: string | number) => {
    await onUpdate(outline.id, field, value);
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell className="w-[40px]">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(outline.id, checked as boolean)}
          />
        </div>
      </TableCell>
      {visibleColumns.header && (
        <TableCell
          className="font-medium cursor-pointer hover:underline"
          onClick={() => onEdit(outline)}
        >
          {outline.header}
        </TableCell>
      )}
      {visibleColumns.sectionType && (
        <TableCell>{outline.sectionType.replace(/_/g, " ")}</TableCell>
      )}
      {visibleColumns.status && (
        <TableCell>
          <Badge
            variant={
              outline.status === "COMPLETED"
                ? "default"
                : outline.status === "IN_PROGRESS"
                  ? "secondary"
                  : "outline"
            }
            className="flex items-center gap-1 w-fit"
          >
            {outline.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
            {outline.status === "IN_PROGRESS" && <Loader2 className="h-3 w-3 animate-spin" />}
            {outline.status === "PENDING" && <Clock className="h-3 w-3" />}
            {outline.status.replace(/_/g, " ")}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.target && (
        <TableCell>
          <InlineEditableCell
            value={outline.target}
            onSave={(val) => handleFieldUpdate("target", val)}
            type="number"
          />
        </TableCell>
      )}
      {visibleColumns.limit && (
        <TableCell>
          <InlineEditableCell
            value={outline.limit}
            onSave={(val) => handleFieldUpdate("limit", val)}
            type="number"
          />
        </TableCell>
      )}
      {visibleColumns.reviewer && (
        <TableCell>
          <InlineEditableCell
            value={outline.reviewer}
            onSave={(val) => handleFieldUpdate("reviewer", val)}
            type="select"
            options={[
              { value: "ASSIM", label: "ASSIM" },
              { value: "BINI", label: "BINI" },
              { value: "MAMI", label: "MAMI" },
            ]}
          />
        </TableCell>
      )}
      <TableCell className="w-[70px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(outline)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(outline.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function OutlineTable() {
  const { data: activeOrg } = useActiveOrganization();
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState<Outline | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("outline");
  const [visibleColumns, setVisibleColumns] = useState({
    header: true,
    sectionType: true,
    status: true,
    target: true,
    limit: true,
    reviewer: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchOutlines = useCallback(async () => {
    if (!activeOrg?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/outlines?organizationId=${activeOrg.id}`);
      if (response.ok) {
        const data = await response.json();
        setOutlines(data);
      }
    } catch (error) {
      console.error("Failed to fetch outlines", error);
    } finally {
      setLoading(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchOutlines();
  }, [fetchOutlines]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOutlines((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const response = await fetch(`/api/outlines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOutlines();
      }
    } catch (error) {
      console.error("Failed to delete outline", error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/outlines/${id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        fetchOutlines();
      }
    } catch (error) {
      console.error("Failed to duplicate outline", error);
    }
  };

  const handleEdit = (outline: Outline) => {
    setSelectedOutline(outline);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedOutline(undefined);
    setIsSheetOpen(true);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(outlines.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    try {
      const response = await fetch(`/api/outlines/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setOutlines((prev) =>
          prev.map((outline) =>
            outline.id === id ? { ...outline, [field]: value } : outline
          )
        );
      }
    } catch (error) {
      console.error("Failed to update outline", error);
      throw error;
    }
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="past-performance">Past Performance</TabsTrigger>
            <TabsTrigger value="management-plan">Management Plan</TabsTrigger>
            <TabsTrigger value="relevant-experience">Relevant Experience</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Customize columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={visibleColumns.header}
                onCheckedChange={() => toggleColumn("header")}
              >
                Header
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.sectionType}
                onCheckedChange={() => toggleColumn("sectionType")}
              >
                Section Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.status}
                onCheckedChange={() => toggleColumn("status")}
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.target}
                onCheckedChange={() => toggleColumn("target")}
              >
                Target
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.limit}
                onCheckedChange={() => toggleColumn("limit")}
              >
                Limit
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.reviewer}
                onCheckedChange={() => toggleColumn("reviewer")}
              >
                Reviewer
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreate}>Add section</Button>
        </div>
      </div>

      {activeTab === "outline" && (
        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedIds.size === outlines.length && outlines.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {visibleColumns.header && <TableHead>Header</TableHead>}
                  {visibleColumns.sectionType && <TableHead>Section Type</TableHead>}
                  {visibleColumns.status && <TableHead>Status</TableHead>}
                  {visibleColumns.target && <TableHead className="w-[100px]">Target</TableHead>}
                  {visibleColumns.limit && <TableHead className="w-[100px]">Limit</TableHead>}
                  {visibleColumns.reviewer && <TableHead>Reviewer</TableHead>}
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : outlines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No sections found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext items={outlines.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                    {outlines.map((outline) => (
                      <SortableRow
                        key={outline.id}
                        outline={outline}
                        selected={selectedIds.has(outline.id)}
                        visibleColumns={visibleColumns}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      )}

      {activeTab !== "outline" && (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          This section is coming soon.
        </div>
      )}

      <OutlineSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        outline={selectedOutline}
        onSuccess={fetchOutlines}
      />
    </div>
  );
}
