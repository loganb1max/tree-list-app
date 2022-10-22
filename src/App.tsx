import { faker } from "@faker-js/faker";
import React, { useCallback, useMemo, useRef } from "react";
import { RenderItemProps, TreeList, TreeListRef } from "./components/tree-list";
import { Section } from "./types/section";

const generateSection = () => ({
  id: faker.random.alphaNumeric(10),
  name: faker.random.words(),
});

const NUM_SECTIONS = 5;

const pickRandomNestedLeaf = (sections: Section[]): Section => {
  const section = faker.helpers.arrayElement(sections);
  if (section.children) {
    return pickRandomNestedLeaf(section.children);
  }
  return section;
};

function App() {
  const sections = useMemo(
    () =>
      faker.helpers.uniqueArray<Section>(
        () => ({
          ...generateSection(),
          children: faker.helpers.uniqueArray<Section>(
            () => ({
              ...generateSection(),
              children: faker.helpers.uniqueArray<Section>(
                generateSection,
                NUM_SECTIONS
              ),
            }),
            NUM_SECTIONS
          ),
        }),
        NUM_SECTIONS
      ),
    []
  );

  const [selectedId, setSelectedId] = React.useState<string | undefined>();
  const [treeVisible, setTreeVisible] = React.useState(true);
  const treeListRef = useRef<TreeListRef>(null);

  const handleToggleTree = useCallback(() => setTreeVisible((cur) => !cur), []);

  const renderItem = useCallback<(props: RenderItemProps) => React.ReactNode>(
    ({ isSectionHeader, isSelected, level, onClick, title }): JSX.Element =>
      isSectionHeader ? (
        <div
          className={`flex items-center justify-between px-2 py-4 transition-all duration-300 cursor-pointer border-green-700 hover:bg-green-700/5 hover:border-l-4 ${
            isSelected ? "text-black" : "text-black/50"
          }`}
          onClick={onClick}
        >
          <span style={{ paddingLeft: level * 20 }} className="pr-20">
            {title}
          </span>
          {isSelected ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      ) : (
        <div
          className={`flex items-center px-2 py-4 transition-all duration-300 cursor-pointer border-green-700 hover:bg-green-700/5 hover:border-l-4 ${
            isSelected
              ? "border-l-4 text-black bg-green-700/10"
              : "text-black/50"
          }`}
          onClick={onClick}
        >
          <span style={{ paddingLeft: `${level * 20}px` }}>{title}</span>
        </div>
      ),
    []
  );

  return (
    <div className="flex w-screen h-screen">
      {treeVisible && (
        <TreeList
          ref={treeListRef}
          sections={sections}
          selectedId={selectedId}
          onSelect={setSelectedId}
          renderItem={renderItem}
        />
      )}
      <div className="ml-auto flex flex-col justify-center p-4 bg-slate-900">
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded"
          onClick={handleToggleTree}
        >
          Toggle Tree List
        </button>
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded mt-2"
          onClick={() =>
            selectedId && treeListRef.current?.scrollToSection(selectedId)
          }
        >
          Scroll to selected section
        </button>
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded mt-2"
          onClick={() => {
            const randomId = pickRandomNestedLeaf(sections).id;
            setSelectedId(randomId);
            treeListRef.current?.scrollToSection(randomId);
          }}
        >
          Scroll to random section
        </button>
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded mt-2"
          onClick={() => treeListRef.current?.expandAll()}
        >
          Expand all
        </button>
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded mt-2"
          onClick={() => treeListRef.current?.collapseAll()}
        >
          Collapse all
        </button>
      </div>
    </div>
  );
}

export default App;
