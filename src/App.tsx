import { faker } from "@faker-js/faker";
import React, { useCallback, useMemo, useRef } from "react";
import { TreeList, TreeListRef } from "./components/tree-list";
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

  return (
    <div className="flex w-screen h-screen">
      {treeVisible && (
        <TreeList
          ref={treeListRef}
          sections={sections}
          selectedId={selectedId}
          onSelect={setSelectedId}
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
          onClick={() => treeListRef.current?.scrollToSection(selectedId!)}
        >
          Scroll to selected section
        </button>
        <button
          className="bg-slate-400 hover:bg-slate-400/50 transition-colors p-2 rounded mt-2"
          onClick={() =>
            treeListRef.current?.scrollToSection(
              pickRandomNestedLeaf(sections).id
            )
          }
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
