export interface AjaxResponse<T> {
  retCode: number;
  retData: T;
  retMsg: string;
}

/**
 * 注册
 * api: registered
 */
export type RegisteredRes = AjaxResponse<{}>;

/**
 * 登陆
 * api: login
 */
export type LoginRes = AjaxResponse<{
  data: {
    id: number
  }
}>;

/**
 * 编辑用户信息
 * api: editUserInfo
 */
export type EditUserInfoRes = AjaxResponse<{}>;

/**
 * 消息列表
 * api: getMsgArr
 */
export interface msgInfo {
  id: number;
  showId: number;
  msg: string;
  time: string;
  toUserId: number;
  toUser: string;
  toUserPicture: string;
  fromUserId: number;
  fromUser: string;
  fromUserPicture: string;
}
export type GetMsgArrRes = AjaxResponse<{
  data: msgInfo[]
}>;

/**
 * 用户列表
 * api: userList
 */
export interface UserInfo {
  id: number;
  userName: string;
  nickname: string;
  sex: string;
  picture: string;
  signature: string;
  address: string;
}
export type UserListRes = AjaxResponse<{
  data: UserInfo[]
}>;

/**
 * 用户详情
 * api: userInfo
 */
export type UserInfoRes = AjaxResponse<{
  data: UserInfo
}>;


/**
 * 添加好友
 * api: addFriend
 */
export type AddFriendRes = AjaxResponse<{}>;

/**
 * 获取待同意好友列表
 * api: getPengingFriend
 */
export type GetPengingFriendRes = AjaxResponse<{
  data: UserInfo[]
}>;

/**
 * 同意好友
 * api: agreeFriend
 */
export type AgreeFriendRes = AjaxResponse<{}>;

/**
 * 获取好友列表
 * api: getFriend
 */
export type GetFriendRes = AjaxResponse<{
  data: UserInfo[]
}>;

