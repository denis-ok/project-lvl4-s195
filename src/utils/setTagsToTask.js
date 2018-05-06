const createTagInDb = (tagModel, tag) => tagModel.create({ name: tag });
const getTagByName = (tagModel, tagName) => tagModel.findOne({ where: { name: tagName } });

const addTagIfNotExist = async (tagModel, tagName) => {
  const tag = await getTagByName(tagModel, tagName);
  if (tag) {
    return;
  }

  await createTagInDb(tagModel, tagName);
};

const addNewTagsToDb = (tagModel, tagNameArr) =>
  Promise.all(tagNameArr.map(tagName => addTagIfNotExist(tagModel, tagName)));

const getTagsColl = (tagModel, tagNameArr) =>
  Promise.all(tagNameArr.map(t => getTagByName(tagModel, t)));

const setTagsToTask = async (tagModel, tagNameArr, taskInstance) => {
  await addNewTagsToDb(tagModel, tagNameArr);

  const tagsColl = await getTagsColl(tagModel, tagNameArr);
  const tagIdArr = tagsColl.map(t => t.id);

  await taskInstance.setTags(tagIdArr);
};

export default setTagsToTask;
