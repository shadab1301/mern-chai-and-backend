const getPublicIdFromCloudnaryUrl = () => {
  const splittedArr = str.split("/");
  const public_id = str
    .split("/")
    .slice(splittedArr.length - 2, splittedArr.length)
    .join("/");

  return public_id;
};

return { getPublicIdFromCloudnaryUrl };
