export const parseAtlas = (atlasContent) => {
  const lines = atlasContent.split('\n').map((line) => line.trim());
  let sprites = [];
  let spriteName = null;
  let spriteContent = null;
  const saveContent = (line, key) => {
    const data = line.split(':')[1].split(',');
    spriteContent[key] = { x: +data[0], y: +data[1] };
  };

  lines.forEach((line) => {
    switch (line.split(':')[0]) {
      case line:
        if (spriteName) {
          sprites.push(spriteContent);
          spriteName = line;
          spriteContent = {};
          break;
        } else {
          spriteName = line;
          spriteContent = {};
          break;
        }
      case 'xy':
        saveContent(line, 'xy');
        break;
      case 'size':
        saveContent(line, 'size');
        break;
      default:
        break;
    }
  });

  sprites.push(spriteContent);

  return sprites;
};
