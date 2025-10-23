import EditSelectedText from './type/edit-selected-text';
import TypographyList from './type/typography-list';

export default function TypeTab() {
  return (
    <div className="p-3 flex flex-col gap-2">
      <TypographyList />
      <hr />
      <EditSelectedText />
    </div>
  );
}
