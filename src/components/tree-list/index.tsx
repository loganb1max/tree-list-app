import {
  useCallback,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Section } from "../../types/section";
import { ListItem } from "./list-item";

export interface TreeListProps {
  sections: Section[];
  onSelect?: (sectionId: string) => void;
  selectedId?: string;
  renderItem?: (props: RenderItemProps) => React.ReactNode;
}

export interface TreeListRef {
  scrollToSection: (sectionId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export interface RenderItemProps {
  title: string;
  onClick: () => void;
  isSelected: boolean;
  isSectionHeader: boolean;
  level: number;
  id: string;
}

const mapPaths = (sections: Section[]): { [key: string]: string[] } => {
  const paths: { [key: string]: string[] } = {};
  const traverse = (section: Section, path: string[]) => {
    paths[section.id] = path;
    section.children?.forEach((child) => traverse(child, [...path, child.id]));
  };
  sections.forEach((section) => traverse(section, [section.id]));
  return paths;
};

const flattenSections = (sections: Section[]): Section[] => {
  return sections.reduce((acc, section) => {
    acc.push(section);
    if (section.children) {
      acc.push(...flattenSections(section.children));
    }
    return acc;
  }, [] as Section[]);
};

const allWithChildren = (sections: Section[]): string[] => {
  const all = sections.filter((section) => section.children);
  return all.reduce((acc, section) => {
    acc.push(section.id);
    if (section.children) {
      acc.push(...allWithChildren(section.children));
    }
    return acc;
  }, [] as string[]);
};

export const TreeList = forwardRef<TreeListRef, TreeListProps>(
  ({ sections, onSelect, selectedId, renderItem }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const paths = useMemo(() => mapPaths(sections), [sections]);
    const flatted = useMemo(() => flattenSections(sections), [sections]);
    const sectionHeaderIds = useMemo(
      () => allWithChildren(sections),
      [sections]
    );
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);

    useEffect(() => {
      if (scrollTargetId) {
        if (!containerRef.current) {
          return;
        }

        try {
          const el: HTMLDivElement | null = containerRef.current?.querySelector(
            `#${scrollTargetId}`
          );
          const halfContainerHeight = containerRef.current.clientHeight / 2;

          if (el) {
            containerRef.current?.scrollTo({
              top: el.offsetTop + halfContainerHeight,
              behavior: "smooth",
            });
          }
        } catch (err) {
          // ignore
        }

        setScrollTargetId(null);
      }
    }, [scrollTargetId]);

    const isSectionHeader = useCallback(
      (id: string) => sectionHeaderIds.includes(id),
      [sectionHeaderIds]
    );

    const toggleSection = useCallback(
      (sectionId: string) => {
        if (isSectionHeader(sectionId)) {
          setOpenSections((prev) => {
            if (prev.includes(sectionId)) {
              return prev.filter((id) => id !== sectionId);
            }
            return [...prev, sectionId];
          });
        }
      },
      [isSectionHeader]
    );

    const handleSelect = useCallback(
      (sectionId: string) => {
        toggleSection(sectionId);
        if (!isSectionHeader(sectionId)) {
          onSelect?.(sectionId);
        }
      },
      [isSectionHeader, onSelect, toggleSection]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToSection: (sectionId: string) => {
          const path = paths[sectionId];
          if (path) {
            setOpenSections((prev) => [...prev, ...path.slice(0, -1)]);
          }
          setScrollTargetId(sectionId);
        },
        expandAll: () => {
          setOpenSections(sectionHeaderIds);
        },
        collapseAll: () => {
          setOpenSections([]);
        },
      }),
      [paths, sectionHeaderIds]
    );

    const shouldRenderChildren = useCallback(
      (sectionId: string) => {
        const path = paths[sectionId];
        return (
          path.length === 1 ||
          path.every((id) => openSections.includes(id) || id === sectionId)
        );
      },
      [openSections, paths]
    );

    const selectedPath = selectedId ? paths[selectedId] : [];

    return (
      <div className="overflow-y-auto relative" ref={containerRef}>
        {flatted
          .filter((section) => shouldRenderChildren(section.id))
          .map((section) => {
            const isSelected =
              selectedPath?.includes(section.id) ||
              openSections?.includes(section.id);
            const level = paths[section.id].length - 1;

            return (
              <ListItem
                key={section.id}
                id={section.id}
                title={section.name}
                onSelect={handleSelect}
                level={level}
                isSelected={isSelected}
                isSectionHeader={Boolean(section.children)}
                renderItem={renderItem}
              />
            );
          })}
      </div>
    );
  }
);

TreeList.displayName = "TreeList";
