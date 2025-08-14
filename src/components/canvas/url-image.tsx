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

  return <Image image={image} {...rest} />;
};

export default URLImage;
