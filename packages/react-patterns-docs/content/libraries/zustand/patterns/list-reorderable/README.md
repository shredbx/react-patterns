# Reorderable List Slice

## Overview

Maintains display order for list items with comprehensive drag-and-drop operations and position management. Provides efficient reordering capabilities while working seamlessly with list data.

## When to Use

- **Image galleries**: Reorder photos, set featured images
- **Todo lists**: Prioritize tasks by position
- **Navigation menus**: Customize item order
- **Playlists**: Arrange songs, albums, or media
- **Dashboard widgets**: User-customizable layouts
- **Form field ordering**: Dynamic form builders

## When NOT to Use

- **Static lists**: No reordering needed
- **Server-ordered data**: Order determined by backend logic
- **Large datasets**: Consider virtualization for thousands of items

## API Reference

### State

```ts
interface ReorderableListSliceState<TId> {
  order: TId[];
}
```

### Actions

```ts
interface ReorderableListSliceActions<TId> {
  setOrder: (order: TId[]) => void;
  move: (id: TId, newIndex: number) => void;
  moveToTop: (id: TId) => void;
  moveToBottom: (id: TId) => void;
  moveUp: (id: TId) => void;
  moveDown: (id: TId) => void;
}
```

### Creator Function

```ts
createReorderableListStoreSlice<TId>(
  initialOrder?: TId[] = []
): StateCreator<ReorderableListSlice<TId>>
```

## Usage Examples

### Image Gallery with Drag and Drop

```ts
import { create } from "zustand";
import { createListStoreSlice } from "../list/list.store.slice";
import { createReorderableListStoreSlice } from "./list-reorderable.store.slice";

type Image = {
  id: string;
  url: string;
  alt: string;
  isFeatured?: boolean;
};

const useImageGalleryStore = create((...args) => ({
  ...createListStoreSlice<string, Image>({})(...args),
  ...createReorderableListStoreSlice<string>([])(...args),
}));

// Initialize gallery with order
function loadImages(images: Image[]) {
  const { setData, setOrder } = useImageGalleryStore.getState();

  // Set image data
  const imageMap = images.reduce(
    (acc, img) => ({
      ...acc,
      [img.id]: img,
    }),
    {}
  );
  setData(imageMap);

  // Set initial order (featured first, then by upload date)
  const sortedIds = images
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      return (
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      );
    })
    .map((img) => img.id);

  setOrder(sortedIds);
}

// Gallery component with drag and drop
function ImageGallery() {
  const { data: images, order, move } = useImageGalleryStore();

  const orderedImages = order.map((id) => images?.[id]).filter(Boolean);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);

      move(active.id as string, newIndex);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="gallery">
          {orderedImages.map((image, index) => (
            <SortableImage key={image.id} image={image} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// Individual sortable image
function SortableImage({ image, index }: { image: Image; index: number }) {
  const { moveToTop, moveUp, moveDown, moveToBottom } = useImageGalleryStore();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="image-item">
      <img src={image.url} alt={image.alt} />

      <div className="image-controls">
        <button {...attributes} {...listeners} className="drag-handle">
          ⋮⋮
        </button>

        <div className="position-controls">
          <button onClick={() => moveToTop(image.id)}>↑↑</button>
          <button onClick={() => moveUp(image.id)}>↑</button>
          <button onClick={() => moveDown(image.id)}>↓</button>
          <button onClick={() => moveToBottom(image.id)}>↓↓</button>
        </div>
      </div>
    </div>
  );
}
```

### Todo List with Priority Management

```ts
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
};

const useTodoStore = create((...args) => ({
  ...createListStoreSlice<string, Todo>({})(...args),
  ...createReorderableListStoreSlice<string>([])(...args),
}));

// Add todo and insert at priority-appropriate position
function addTodo(text: string, priority: Todo["priority"]) {
  const {
    data: todos,
    order,
    setData,
    setOrder,
    move,
  } = useTodoStore.getState();

  const todoId = crypto.randomUUID();
  const newTodo: Todo = {
    id: todoId,
    text,
    completed: false,
    priority,
  };

  // Add to data
  setData({
    ...todos,
    [todoId]: newTodo,
  });

  // Insert at appropriate position based on priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const newOrder = [...order, todoId];

  // Find insertion point
  let insertIndex = 0;
  for (let i = 0; i < order.length; i++) {
    const existingTodo = todos?.[order[i]];
    if (
      existingTodo &&
      priorityOrder[existingTodo.priority] > priorityOrder[priority]
    ) {
      break;
    }
    insertIndex = i + 1;
  }

  setOrder(newOrder);
  move(todoId, insertIndex);
}

// Priority-based quick actions
function TodoPriorityControls({ todoId }: { todoId: string }) {
  const { data: todos, moveToTop } = useTodoStore();
  const todo = todos?.[todoId];

  if (!todo) return null;

  const makePriority = (priority: Todo["priority"]) => {
    // Update todo data
    const { data, setData } = useTodoStore.getState();
    if (data) {
      setData({
        ...data,
        [todoId]: { ...todo, priority },
      });
    }

    // Move to top if high priority
    if (priority === "high") {
      moveToTop(todoId);
    }
  };

  return (
    <div className="priority-controls">
      <button
        onClick={() => makePriority("high")}
        className={todo.priority === "high" ? "active" : ""}
      >
        High
      </button>
      <button
        onClick={() => makePriority("medium")}
        className={todo.priority === "medium" ? "active" : ""}
      >
        Medium
      </button>
      <button
        onClick={() => makePriority("low")}
        className={todo.priority === "low" ? "active" : ""}
      >
        Low
      </button>
    </div>
  );
}
```

### Playlist Management

```ts
type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
};

const usePlaylistStore = create((...args) => ({
  ...createListStoreSlice<string, Track>({})(...args),
  ...createReorderableListStoreSlice<string>([])(...args),
}));

// Playlist component with advanced reordering
function Playlist() {
  const { data: tracks, order, move, moveToTop } = usePlaylistStore();

  const orderedTracks = order.map((id) => tracks?.[id]).filter(Boolean);

  const totalDuration = orderedTracks.reduce(
    (sum, track) => sum + track.duration,
    0
  );

  // Shuffle playlist
  const shufflePlaylist = () => {
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    usePlaylistStore.getState().setOrder(shuffled);
  };

  // Sort by artist
  const sortByArtist = () => {
    if (!tracks) return;

    const sorted = order.sort((a, b) => {
      const trackA = tracks[a];
      const trackB = tracks[b];
      return trackA.artist.localeCompare(trackB.artist);
    });

    usePlaylistStore.getState().setOrder(sorted);
  };

  return (
    <div className="playlist">
      <header className="playlist-header">
        <h2>My Playlist ({orderedTracks.length} tracks)</h2>
        <p>
          Total: {Math.floor(totalDuration / 60)}:
          {(totalDuration % 60).toString().padStart(2, "0")}
        </p>

        <div className="playlist-controls">
          <button onClick={shufflePlaylist}>🔀 Shuffle</button>
          <button onClick={sortByArtist}>🔤 Sort by Artist</button>
        </div>
      </header>

      <div className="track-list">
        {orderedTracks.map((track, index) => (
          <TrackItem
            key={track.id}
            track={track}
            index={index}
            isPlaying={currentTrack?.id === track.id}
          />
        ))}
      </div>
    </div>
  );
}

function TrackItem({
  track,
  index,
  isPlaying,
}: {
  track: Track;
  index: number;
  isPlaying: boolean;
}) {
  const { moveUp, moveDown, moveToTop } = usePlaylistStore();

  return (
    <div className={`track-item ${isPlaying ? "playing" : ""}`}>
      <span className="track-number">{index + 1}</span>

      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist">{track.artist}</div>
      </div>

      <div className="track-duration">
        {Math.floor(track.duration / 60)}:
        {(track.duration % 60).toString().padStart(2, "0")}
      </div>

      <div className="track-controls">
        {isPlaying && (
          <button onClick={() => moveToTop(track.id)}>⭐ Move to Top</button>
        )}
        <button onClick={() => moveUp(track.id)} disabled={index === 0}>
          ↑
        </button>
        <button onClick={() => moveDown(track.id)}>↓</button>
      </div>
    </div>
  );
}
```

## Architecture Details

### Position Management

The slice provides several movement operations with built-in safety:

```ts
// Clamp helper ensures indices stay within bounds
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

// Move to specific index
move: (id, newIndex) => {
  const currentIndex = order.indexOf(id);
  if (currentIndex === -1) return; // Item not found

  const bounded = clamp(newIndex, 0, order.length - 1);

  // Array manipulation with Immer
  const item = order.splice(currentIndex, 1)[0];
  order.splice(bounded, 0, item);
};
```

### Efficient Array Operations

All operations use Immer for safe array mutations:

```ts
// Move up (safe at boundaries)
moveUp: (id) => {
  const idx = order.indexOf(id);
  if (idx <= 0) return; // Already at top or not found

  const item = order.splice(idx, 1)[0];
  order.splice(idx - 1, 0, item);
};
```

### Integration with List Data

The order array contains IDs that reference items in the list:

```ts
// Order maintains references to list items
order: ["img-1", "img-3", "img-2"]
list: {
  "img-1": { id: "img-1", url: "...", alt: "First" },
  "img-2": { id: "img-2", url: "...", alt: "Second" },
  "img-3": { id: "img-3", url: "...", alt: "Third" }
}

// Ordered rendering
const orderedItems = order.map(id => list[id]).filter(Boolean);
```

## Performance Characteristics

- **Move operations**: O(n) where n is array length (typically small for UI lists)
- **Boundary operations**: O(n) for array splice operations
- **Position queries**: O(n) for indexOf operations
- **Memory**: Single array of IDs, minimal overhead

## Dependencies

### External Dependencies

```ts
import { StateCreator } from "zustand"; // Store creation
import { produce } from "immer"; // Immutable updates
```

### Internal Dependencies

```ts
import { ReorderableListSlice } from "./list-reorderable.store.slice.types";
```

### Composition Dependencies

**Typically composed with**: List slice for data storage

- Order array references IDs in the list
- No strict requirement, but commonly used together

## Advanced Patterns

### Custom Sorting

```ts
function useCustomSort<T>() {
  const { data: items, order, setOrder } = useStore<string, T>();

  const sortBy = useCallback(
    (sortFn: (a: T, b: T) => number) => {
      if (!items) return;

      const sorted = order
        .map((id) => ({ id, item: items[id] }))
        .filter(({ item }) => item)
        .sort((a, b) => sortFn(a.item, b.item))
        .map(({ id }) => id);

      setOrder(sorted);
    },
    [items, order, setOrder]
  );

  return { sortBy };
}

// Usage
const { sortBy } = useCustomSort<Product>();

sortBy((a, b) => a.price - b.price); // Sort by price
sortBy((a, b) => a.name.localeCompare(b.name)); // Sort by name
```

### Batch Reordering

```ts
function useBatchReorder() {
  const { order, setOrder } = useReorderableStore();

  const reorderMultiple = useCallback(
    (moves: Array<{ id: string; newIndex: number }>) => {
      let newOrder = [...order];

      // Sort moves by target index to avoid conflicts
      const sortedMoves = moves.sort((a, b) => a.newIndex - b.newIndex);

      sortedMoves.forEach(({ id, newIndex }) => {
        const currentIndex = newOrder.indexOf(id);
        if (currentIndex !== -1) {
          const item = newOrder.splice(currentIndex, 1)[0];
          newOrder.splice(newIndex, 0, item);
        }
      });

      setOrder(newOrder);
    },
    [order, setOrder]
  );

  return { reorderMultiple };
}
```

### Drag and Drop Integration

```ts
// With @dnd-kit
function useDragAndDrop() {
  const { order, move } = useReorderableStore();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = order.indexOf(active.id as string);
        const newIndex = order.indexOf(over.id as string);

        move(active.id as string, newIndex);
      }
    },
    [order, move]
  );

  return { handleDragEnd };
}

// With react-beautiful-dnd
function useBeautifulDnd() {
  const { order, setOrder } = useReorderableStore();

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(order);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setOrder(items);
    },
    [order, setOrder]
  );

  return { handleDragEnd };
}
```

## Testing Guidelines

### Unit Testing

```ts
import { createReorderableListStoreSlice } from "./list-reorderable.store.slice";

describe("ReorderableListStoreSlice", () => {
  const initialOrder = ["a", "b", "c"];

  it("should initialize with provided order", () => {
    const slice = createReorderableListStoreSlice(initialOrder);
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    expect(result.order).toEqual(initialOrder);
  });

  it("should move item to new position", () => {
    const slice = createReorderableListStoreSlice(initialOrder);
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    result.move("a", 2); // Move "a" to index 2

    expect(mockSet).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle boundary conditions", () => {
    const slice = createReorderableListStoreSlice(initialOrder);
    const mockSet = jest.fn();
    const result = slice(mockSet, jest.fn(), jest.fn());

    result.moveUp("a"); // Already at top
    result.moveDown("c"); // Already at bottom

    // Should be safe no-ops
    expect(mockSet).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

```ts
describe("Reorderable List Integration", () => {
  it("should maintain order consistency", () => {
    const store = create((...args) => ({
      ...createListStoreSlice<string, TestItem>({
        a: { id: "a", name: "Item A" },
        b: { id: "b", name: "Item B" },
        c: { id: "c", name: "Item C" },
      })(...args),
      ...createReorderableListStoreSlice<string>(["a", "b", "c"])(...args),
    }));

    // Move item
    store.getState().move("a", 2);

    const { order, data } = store.getState();

    // Check order is updated
    expect(order).toEqual(["b", "c", "a"]);

    // Check data integrity
    expect(data).toHaveProperty("a");
    expect(data).toHaveProperty("b");
    expect(data).toHaveProperty("c");
  });
});
```

## Common Patterns

### Keyboard Navigation

```ts
function useKeyboardReordering() {
  const { order, moveUp, moveDown, moveToTop, moveToBottom } =
    useReorderableStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (e.ctrlKey) {
            moveToTop(selectedId);
          } else {
            moveUp(selectedId);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (e.ctrlKey) {
            moveToBottom(selectedId);
          } else {
            moveDown(selectedId);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, moveUp, moveDown, moveToTop, moveToBottom]);

  return { selectedId, setSelectedId };
}
```

### Order Persistence

```ts
function useOrderPersistence(key: string) {
  const { order, setOrder } = useReorderableStore();

  // Load order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsedOrder = JSON.parse(saved);
        setOrder(parsedOrder);
      } catch (error) {
        console.warn("Failed to load saved order:", error);
      }
    }
  }, [key, setOrder]);

  // Save order to localStorage
  useEffect(() => {
    if (order.length > 0) {
      localStorage.setItem(key, JSON.stringify(order));
    }
  }, [key, order]);
}
```

### Visual Feedback

```ts
function useReorderFeedback() {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<number | null>(null);

  const getItemClassName = useCallback(
    (id: string, index: number) => {
      const classes = ["reorderable-item"];

      if (draggedId === id) {
        classes.push("dragging");
      }

      if (dropZone === index) {
        classes.push("drop-zone");
      }

      return classes.join(" ");
    },
    [draggedId, dropZone]
  );

  return {
    draggedId,
    setDraggedId,
    dropZone,
    setDropZone,
    getItemClassName,
  };
}
```

## Migration Guide

### From Array State

```ts
// Before: Manual array reordering
const [items, setItems] = useState<Item[]>([]);

const moveItem = (fromIndex: number, toIndex: number) => {
  const newItems = [...items];
  const [moved] = newItems.splice(fromIndex, 1);
  newItems.splice(toIndex, 0, moved);
  setItems(newItems);
};

// After: Reorderable slice
const { order, move } = useReorderableStore();

const moveItem = (id: string, toIndex: number) => {
  move(id, toIndex);
};
```

### From Manual Index Management

```ts
// Before: Manual position tracking
const [itemOrder, setItemOrder] = useState<string[]>([]);

const moveUp = (id: string) => {
  const index = itemOrder.indexOf(id);
  if (index > 0) {
    const newOrder = [...itemOrder];
    [newOrder[index], newOrder[index - 1]] = [
      newOrder[index - 1],
      newOrder[index],
    ];
    setItemOrder(newOrder);
  }
};

// After: Reorderable slice with built-in operations
const { moveUp } = useReorderableStore();
```

## Troubleshooting

### Common Issues

1. **Items not found in order**

   - Ensure order array contains valid IDs
   - Check that list data and order are synchronized

2. **Drag and drop not working**

   - Verify drag library integration is correct
   - Check that move operations are called with correct indices

3. **Performance issues with large lists**
   - Consider virtualization for lists > 1000 items
   - Use React.memo for list item components

### Anti-patterns

1. **Direct order array modification**

   ```ts
   // ❌ Don't modify order directly
   order.push(newId);
   order.sort();

   // ✅ Use slice methods
   setOrder([...order, newId]);
   ```

2. **Ignoring boundary conditions**

   ```ts
   // ❌ No bounds checking
   move(id, -1); // Invalid index

   // ✅ Slice handles bounds automatically
   moveUp(id); // Safe at boundaries
   ```

## Related Patterns

- [List Slice (Base)](../list/) - Commonly composed together
- [List Mutable Slice](../list-mutable/) - Can be combined for mutable reorderable lists
- [Drag and Drop Patterns](../../patterns/drag-drop/) - Implementation examples
- [Keyboard Navigation](../../patterns/accessibility/) - Accessibility patterns
