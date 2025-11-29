import ImageDropZone from '../image-input';
import EnhanceCanvas from './enhance/EnhanceCanvas';

const EnhanceTab = () => {
  return (
    <>
      <ImageDropZone />
      <hr />
      <EnhanceCanvas />
    </>
  );
};

export default EnhanceTab;
