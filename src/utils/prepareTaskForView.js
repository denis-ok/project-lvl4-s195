const prepareTaskForView = async (task) => {
  const obj = task.dataValues;
  const status = await task.getTaskStatus();
  const creator = await task.getCreator();
  const worker = await task.getWorker();
  const tagsColl = await task.getTags();
  const tagsArr = tagsColl.map(t => t.name);
  const tagsString = tagsArr.join(', ');

  obj.status = status ? status.name : '';
  obj.creator = creator ? creator.getFullname() : '';
  obj.worker = worker ? worker.getFullname() : '';
  obj.tagsString = tagsString || '';

  return obj;
};

export default prepareTaskForView;
