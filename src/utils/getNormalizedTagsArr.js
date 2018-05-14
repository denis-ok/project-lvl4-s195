export default tagsStr => tagsStr.split(/\W/).filter(el => el !== '').map(tag => tag.toLowerCase());

