import { memo } from "react";
import { RenderItemProps } from ".";

interface ListItemProps {
  title: string;
  onSelect?: (id: string) => void;
  id: string;
  isSectionHeader: boolean;
  level: number;
  isSelected: boolean;
  renderItem?: (props: RenderItemProps) => React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = memo(
  ({ title, onSelect, id, isSectionHeader, level, isSelected, renderItem }) => {
    if (renderItem) {
      return (
        <div id={id}>
          {renderItem({
            title,
            onClick: () => onSelect?.(id),
            isSelected,
            isSectionHeader,
            level,
            id,
          })}
        </div>
      );
    }

    return (
      <div
        id={id}
        className={`py-2 ${isSelected ? "bg-gray-200" : ""}`}
        style={{ paddingLeft: `calc(${level} * 1rem)` }}
        onClick={() => onSelect?.(id)}
      >
        {title}
        {isSectionHeader && (
          <span className="text-gray-400 ml-2">({level})</span>
        )}
      </div>
    );
  }
);

ListItem.displayName = "ListItem";
