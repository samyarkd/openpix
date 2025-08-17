import Konva from 'konva';
import { Image } from 'react-konva';
import { useImage } from '~/hooks/use-image';

const URLImage = ({
  src,
  ...rest
}: Omit<Konva.ImageConfig, 'image'> & { src: string }) => {
  const [image] = useImage(src, { crossOrigin: 'anonymous' });

  if (!image) {
    return null;
  }

  // react-konva Image is a canvas node, not an <img>
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image image={image} {...rest} />;
};

export default URLImage;
