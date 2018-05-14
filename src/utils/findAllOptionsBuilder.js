import { TaskStatus, Tag } from '../models';
import getNormalizedTagsArr from '../utils/getNormalizedTagsArr';

const buildOptionsForFindAll = (queryObject, creatorId) => {
  const options = {
    where: {},
    include: [],
  };

  if (queryObject.createdByMe && creatorId) {
    options.where.creatorId = creatorId;
  }

  if (queryObject.worker !== 'any') {
    const workerId = queryObject.worker.split(' ')[0];
    options.where.assignedTo = workerId;
  }

  if (queryObject.status !== 'any') {
    const includeObj = { model: TaskStatus, where: { name: queryObject.status } };
    options.include.push(includeObj);
  }

  if (queryObject.tags) {
    const tagsArr = getNormalizedTagsArr(queryObject.tags);
    const includeObj = { model: Tag, where: { name: tagsArr } };
    options.include.push(includeObj);
  }

  return options;
};

export default buildOptionsForFindAll;
