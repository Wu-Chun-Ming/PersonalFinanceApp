import { Image } from 'expo-image';

type Props = {
  selectedImage?: string;
};

const ImageViewer = ({ selectedImage }: Props) => {
  return <Image
    source={{ uri: selectedImage }}
    style={{
      width: '100%',
      height: '100%',
    }}
  />
}

export default ImageViewer;