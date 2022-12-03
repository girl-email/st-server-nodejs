import * as fs from 'fs';
import * as path from 'path';

/**对象拷贝新的结构体
 * 开销特别高的 注意使用
 */
export function func_copy<T>(obj: T, bFunc = false): T {
  var out: any = {};
  if (obj instanceof Array) {
    out = [];
  }

  if (typeof obj == 'object') {
    for (var key in obj) {
      if (key == 'clone' || key == 'global') {
        continue;
      }
      if (typeof obj[key] == 'function' && !bFunc) {
        continue;
      }
      if (obj[key] == null) {
        out[key] = null;
      }
      else if (typeof obj[key] == 'object') {
        out[key] = func_copy(obj[key], false);
      }
      else {
        out[key] = obj[key];
      }
    }
  }
  else {
    out = obj;
  }
  return <T>out;
}

/**对象拷贝后添加进入新的结构体
 * 开销特别高的 注意使用
 */
export function func_copy_in(dst: object, src: object) {
  let cp_v = func_copy(src);
  for (let key in cp_v) {
    dst[key] = cp_v[key];
  }

  return dst;
}

export class TeDate extends Date {
  static Date_Format(date: Date, fmt: string) { //author: meizz
    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    var o = {
      "M+": date.getMonth() + 1,                 //月份
      "d+": date.getDate(),                    //日
      "h+": date.getHours(),                   //小时
      "m+": date.getMinutes(),                 //分
      "s+": date.getSeconds(),                 //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

  static DateToStr(date: Date | number) {
    if (typeof date == 'number') {
      date = new Date(date);
    }
    return TeDate.Date_Format(date, "yyyy-MM-dd hh:mm:ss")
  }

  static DateToLogStr(date: Date | number) {
    if (typeof date == 'number') {
      date = new Date(date);
    }
    return TeDate.Date_Format(date, "yyyy_MM_dd_hh")
  }

  static IsYesterday(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是昨天的
    var oneday = 1000 * 60 * 60 * 24;
    if (rightTime - leftTime > oneday) {
      return false;
    }
    return true;
  }
  static Isdiffday(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是今天的
    var nowDate: Date = new Date(rightTime);
    var checkDate: Date = new Date(leftTime);
    if (checkDate.getFullYear() != nowDate.getFullYear() ||
      checkDate.getMonth() != nowDate.getMonth() ||
      checkDate.getDate() != nowDate.getDate()) {
      return true;
    }

    return false;
  }

  static Isdiffweek(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是今天的
    var rightDate: Date = new Date(rightTime);
    var leftDate: Date = new Date(leftTime);
    // 周判断的时候是有跨越的，所以先计算一下插值
    var diffTime = 0;
    if (leftTime > rightTime) {
      diffTime = leftTime - rightTime;
      if (leftDate.getDay() < rightDate.getDay()) {
        return true;
      }
    }
    else {
      diffTime = rightTime - leftTime;
      if (rightDate.getDay() < leftDate.getDay()) {
        return true;
      }
    }

    if (diffTime / (1000 * 60 * 60 * 24) >= 7) {
      return true;
    }

    return false;
  }

  static Isdiffmonth(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是今天的
    var nowDate: Date = new Date(rightTime);
    var checkDate: Date = new Date(leftTime);
    if (checkDate.getFullYear() != nowDate.getFullYear() ||
      checkDate.getMonth() != nowDate.getMonth()) {
      return true;
    }

    return false;
  }

  static Isdiffhour(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是今天的
    var nowDate: Date = new Date(rightTime);
    var checkDate: Date = new Date(leftTime);
    if (checkDate.getHours() != nowDate.getHours()) {
      return true;
    }

    return false;
  }

  static IsdiffMinute(leftTime: number, rightTime: number = Date.now()): Boolean {
    // 判断时间是否是今天的
    var nowDate: Date = new Date(rightTime);
    var checkDate: Date = new Date(leftTime);
    if (checkDate.getMinutes() != nowDate.getMinutes()) {
      return true;
    }

    return false;
  }

  /**
   * 判断两个时间相差多少天
   * @param leftTime
   * @param rightTime
   */
  static daydiff(leftTime: number, rightTime: number = Date.now()): number {
    // 判断时间是否是今天的
    var nowDate: Date = new Date(rightTime);
    var checkDate: Date = new Date(leftTime);
    nowDate.setHours(0, 0, 0, 0);
    checkDate.setHours(0, 0, 0, 0);
    return Math.floor(nowDate.getTime() - checkDate.getTime()) / (24 * 3600 * 1000);
  }

  /**
   * 转换成一天的开始
   * @param time
   */
  static ToDate0(time: number) {
    var nowDate: Date = new Date(time);
    nowDate.setHours(0, 0, 0, 0);
    return nowDate.getTime();
  }

  /**
   * 转换成一天的最后
   * @param time
   */
  static ToDate24(time: number) {
    var nowDate: Date = new Date(time);
    nowDate.setHours(23, 59, 59, 999);
    return nowDate.getTime();
  }
}


function compareList<T>(a: T, key: string, value: any) {
  if (!a || !a.hasOwnProperty(key)) return -1;
  if (a[key] > value) return 1;
  if (a[key] == value) return 0;
  return -1;
}


/**
 * 开始二分法查找
 * @param list 查找用的列表
 * @param key 查找的单位元素
 * @param value 比较用的数值
 */
export function orderListFind<T>(list: Array<T>, key: string, value: any, desc: boolean = false) {
  if (list.length == 0) return 0;
  var small = -1, big = list.length;
  // @ts-ignore
  let foop = 0;

  while (true) {
    foop++;
    // 强制修正
    //if(foop > list.length) break;
    var ret = 0;
    var center = Math.floor((small + big) / 2);
    if (small == big) {
      if (small == -1 || big == list.length) return small;
      switch (compareList<T>(list[big], key, value)) {
        case 0: return big;
        case -1: return desc ? big - 1 : big + 1;
        case 1: return desc ? big + 1 : big;
      }
    }
    else if (small + 1 == big) {
      // 差一个的时候比较一下小的
      // switch (compareList<T>(list[big], key, value)) {
      //     case 0: return big;
      //     case -1: return desc ? small : (big == list.length ? big : big + 1);
      //     case 1: return desc ? big + 1 : small;
      // }

      // 这里比较一下，先从小的开始
      var sr = -2, br = -2;
      if (small >= 0) {
        sr = compareList<T>(list[small], key, value);
      }

      if (big < list.length) {
        br = compareList<T>(list[big], key, value);
      }
      if (desc) {
        if (sr != -2 && br != -2) {
          if (sr == -1) {
            return small - 1;
          }
          else if (sr == 0) {
            return small;
          }
          else if (br == 0) {
            return big;
          }
          else if (br == -1) {
            // 这里 比小的大，但是比大的小
            return small;
          }
          else {
            return big;
          }
        }
        else if (br != -2) {
          // 这里小的是不存在的，就是说大的是第 0 位
          if (br == -1) {
            return small;
          }
          else {
            return big;
          }
        }
        else if (sr != -2) {
          // 这里表示大的不存在，就是说小的是最后一个
          if (sr == -1) {
            return small - 1;
          }
          else {
            return small;
          }
        }
        else {
          return -1;
        }
      }
      else {
        if (sr != -2 && br != -2) {
          if (sr == 1) {
            return small - 1;
          }
          else if (sr == 0) {
            return small;
          }
          else if (br == 0) {
            return big;
          }
          else if (br == 1) {
            // 这里 比小的大，但是比大的小
            return small;
          }
          else {
            return big;
          }
        }
        else if (br != -2) {
          // 这里小的是不存在的，就是说大的是第 0 位
          if (br == 1) {
            return small;
          }
          else {
            return big;
          }
        }
        else if (sr != -2) {
          // 这里表示大的不存在，就是说小的是最后一个
          if (sr == 1) {
            return small - 1;
          }
          else {
            return small;
          }
        }
        else {
          return -1;
        }
      }
    }
    else {
      ret = compareList<T>(list[center], key, value);
    }

    if (desc) {
      switch (ret) {
        case 0:// 中间值是相等的数值的 当成 1处理
          big = center;
          break;
        case 1:
          small = center;
          break;
        case -1: big = center; break;
      }
    }
    else {
      switch (ret) {
        case 0: // 中间值是相等的数值的 当成 1处理
          big = center;
          break;
        case 1: big = center; break;
        case -1:
          small = center;
          break;
      }
    }
  }
}

export function orderListInsert<T>(insertValue: T, list: Array<T>, key: string, value: any, desc: boolean = false) {
  // 先找一下位置
  var index = orderListFind<T>(list, key, value, desc);
  list.splice(index + 1, 0, insertValue);
}

export function orderListRemove<T>(list: Array<T>, key: string, value: any, desc: boolean = false) {
  var index = orderListFind<T>(list, key, value, desc);
  for (var i = index; i < list.length;) {
    var rkInfo = list[i];
    if (rkInfo[key] == value) {
      list.splice(i, 1);
    }
    else {
      break;
    }
  }
}


export class HashMap<T>{
  _data: Object = {};
  auto_size: number = 0;
  _list: PriorityQueue = new PriorityQueue();
  constructor() {

  }

  has(key: string | number) {
    key = key.toString();
    if (this.auto_size) {
      this._list.use(key);
    }
    return this._data.hasOwnProperty(key);
  }

  get(key: string | number) {
    key = key.toString();
    this.use(key);
    return (<Array<T>>this._data[key]) || [];
  }

  add(key: string | number, v: T) {
    key = key.toString();
    if (!this._data[key]) {
      this.set(key, [v]);
    }
    else {
      this._data[key].push(v);
      this.use(key);
    }
  }

  private use(key: string) {
    if (this.auto_size) {
      this._list.use(key);
    }
  }

  get keys() {
    return Object.keys(this._data);
  }

  set(key: string | number, v: Array<T>) {
    key = key.toString();
    this._data[key] = v;

    this.use(key);
    this._auto_release();
  }

  clear() {
    this._data = {};
    this._list.clear();
  }

  find(key: string | number, fkey: string, fv: any) {
    if (!key) return [];

    var keys = fkey.split('.');
    var out: Array<T> = [];
    key = key.toString();
    var rkV = this.get(key);
    if (rkV.length <= 0) {
      return out;
    }

    for (var i = 0; i < rkV.length; i++) {
      var info = rkV[i];
      if (this._list_find(info, keys, fv)) {
        out.push(info);
      }
    }

    return out;
  }

  private _list_find(obj: Object, keys: Array<string>, fv: any) {
    keys = func_copy(keys);
    if (!obj || typeof obj != 'object' || keys.length == 0) {
      return false;
    }

    var rk = keys.shift();
    if (keys.length == 0) {
      return obj[rk] == fv;
    }

    return this._list_find(obj[rk], keys, fv);
  }

  private _list_rest(obj: Object, keys: Array<string>, restv: any) {
    keys = func_copy(keys);
    if (!obj || typeof obj != 'object' || keys.length == 0) {
      return false;
    }

    var rk = keys.shift();
    if (keys.length == 0) {
      return obj[rk] = restv;
    }

    return this._list_rest(obj[rk], keys, restv);
  }


  find2Reset(key: string | number, fkey: string, fv: any, dkey: string, restv: any) {
    var keys = fkey.split('.');
    var keys2 = dkey.split('.');
    key = key.toString();
    var rkV = this.get(key);
    if (rkV.length > 0) {
      for (var i = 0; i < rkV.length; i++) {
        var info = rkV[i];
        if (this._list_find(info, keys, fv)) {
          this._list_rest(info, keys2, restv);
          return true;
        }
      }
    }

    return false;
  }

  find2Del(key: string | number, fkey: string, fv: any) {
    var keys = fkey.split('.');
    key = key.toString();
    var rkV = this.get(key);
    if (rkV.length > 0) {
      for (var i = 0; i < rkV.length; i++) {
        var info = rkV[i];
        if (this._list_find(info, keys, fv)) {
          rkV.splice(i, 1);
          return true;
        }
      }
    }

    return false;
  }

  del(key: string | number) {
    key = key.toString();
    delete this._data[key];

    this._list.del(key);
  }

  /**
   * 淘汰掉不常用的几个
   */
  private _auto_release() {
    if (!this.auto_size) return;
    if (this._list.length <= this.auto_size) return;
    var dels = this._list.getLast(this._list.length - this.auto_size);
    for (var i = 0; i < dels.length; i++) {
      this.del(dels[i]);
    }
  }
}


export class TeMap<T>{
  _data: Object = {};
  auto_size: number = 0;
  _list: PriorityQueue = new PriorityQueue();

  constructor(_data?: Object) {
    if (_data) {
      this._data = _data;
    }
  }

  has(key: string | number) {
    if (key == undefined || key == null) return false;
    this.use(key);
    return this._data.hasOwnProperty(key.toString());
  }

  get(key: string | number) {
    if (!this.has(key)) return null;
    this.use(key);
    return <T>this._data[key];
  }

  set(key: string | number, v: T) {
    if (v == undefined) {
      delete this._data[key];
    }
    else {
      this.use(key);
      this._data[key] = v;
    }
    // 在设置的时候进行一下大小控制
    this._auto_release();
  }

  private use(key: string | number) {
    if (this.auto_size) {
      this._list.use(key);
    }
  }

  // private _keys_ = [];
  // private _change_ = false;
  // private get _keys() {
  //     return Object.keys(this._data);
  // }

  get keys() {
    return Object.keys(this._data);
  }

  del(key: string | number) {
    var obj = this._data[key];
    if (obj && typeof obj == 'object' && obj['destory'] && typeof obj['destory'] == 'function') {
      obj['destory']();
    }

    delete this._data[key];
    this._list.del(key);
  }

  rand() {
    var keys = this.keys;
    var tid = keys[Math.floor(Math.random() * keys.length)];
    return this.get(tid);
  }

  clear() {
    this._data = {};
    this._list.clear();
  }

  /**
   * 遍历所有单位
   * @param cb 如果返回了true那么结束遍历
   */
  forEach(cb: (key: string, v: T) => boolean) {
    var keys = this.keys;
    var outT: T = null;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var r = this.get(key);
      if (!r) continue;
      if (cb(key, r)) {
        outT = r;
        break;
      }
    }
    return outT;
  }

  /**
   * 淘汰掉不常用的几个
   */
  private _auto_release() {
    if (!this.auto_size) return;
    if (this._list.length <= this.auto_size) return;
    var dels = this._list.getLast(this._list.length - this.auto_size);
    for (var i = 0; i < dels.length; i++) {
      this.del(dels[i]);
    }
  }
}


/**
 * list 的方式实现map
 */
export class MapList<T> {
  _data: Array<T> = [];
  mkey: string;

  constructor(mkey: string) {
    this.mkey = mkey;
  }

  private _find_index(v: string) {
    var num = orderListFind<T>(this._data, this.mkey, v);
    if (num < 0 || num >= this._data.length) return -1;

    var rInfo = this._data[num];
    if (rInfo[this.mkey] != v) {
      return -1;
    }

    return num;
  }

  at(idx: number) {
    return this._data[idx];
  }

  get(v: number | string) {
    v = v.toString();

    var num = this._find_index(v);
    return (num == -1) ? null : this._data[num];
  }

  set(k: number | string, v: T) {
    k = k.toString();
    var num = this._find_index(k);

    if (num >= 0) {
      // 找到了就使用
      this._data[num] = v;
    }
    else {
      // 没找到就要新增一个
      orderListInsert(v, this._data, this.mkey, k);
    }
  }

  remove(v: number | string) {
    v = v.toString();
    orderListRemove(this._data, this.mkey, v);
  }

  get length() {
    return this._data.length;
  }
}

/**
 * 优先级队列，使用多的放在前面，使用少的放在后面
 */
export class PriorityQueue {
  private _uselist: Array<string> = [];

  use(key: string | number) {
    if (key == undefined || key == null) return;
    key = key.toString();
    var index = this._uselist.indexOf(key);
    if (index >= 0) {
      this._uselist.splice(index, 1);
    }
    this._uselist.push(key);
  }

  del(key: string | number) {
    key = key.toString();
    var index = this._uselist.indexOf(key);
    if (index >= 0) {
      this._uselist.splice(index, 1);
    }
  }

  clear() {
    this._uselist = [];
  }

  get length() {
    return this._uselist.length;
  }

  getLast(n: number) {
    var idx_a = Math.max(0, this.length - n);
    return this._uselist.slice(idx_a, this.length);
  }
}

export class DIR {
  static mkdirsSync(dirpath, mode?) {
    mode = mode || 511;
    if (!fs.existsSync(dirpath)) {
      var pathtmp;
      if (dirpath[0] == '/') pathtmp = '/';
      var dirs = dirpath.split(path.sep);
      for (var i = 0; i < dirs.length; i++) {
        var dirname = <string>dirs[i];
        if (dirname.length == 0) continue;
        if (pathtmp) {
          pathtmp = path.join(pathtmp, dirname);
        }
        else {
          pathtmp = dirname;
        }
        if (!fs.existsSync(pathtmp)) {
          fs.mkdirSync(pathtmp, mode)
        }
      }
    }
    return true;
  }

}

export function arrayRandom<T>(a: Array<T>, remove: boolean = false): T {
  var rIndex = Math.floor(Math.random() * a.length);
  var v = a[rIndex];
  if (remove) a.splice(rIndex, 1);
  return v;
}

export function arrayIndex<T>(a: Array<T>, index: number): T {
  if (a.length == 0) return null;
  if (a.length <= index) return a.length[a.length - 1];
  return a[index];
}

export function arrayDel<T>(a: Array<T>, v: T) {
  if (a.length == 0) return true;
  var index = a.indexOf(v);
  if (index >= 0) {
    a.splice(index, 1);
  }

  return true;
}

export function arrayHas<T>(a: Array<T>, v: T): boolean {
  if (!a) return false;

  if (!(a instanceof Array)) {
    return false;
  }

  return (a.indexOf(v) >= 0) ? true : false;
}

export module TeMath {
  // 正态分布表 0 到 3.9
  var gaussian_table = [
    0.5, 0.503989356, 0.507978314, 0.511966473, 0.515953437, 0.519938806, 0.523922183, 0.52790317, 0.531881372, 0.535856393,
    0.539827837, 0.543795313, 0.547758426, 0.551716787, 0.555670005, 0.559617692, 0.563559463, 0.567494932, 0.571423716, 0.575345435,
    0.579259709, 0.583166163, 0.587064423, 0.590954115, 0.594834872, 0.598706326, 0.602568113, 0.606419873, 0.610261248, 0.614091881,
    0.617911422, 0.621719522, 0.625515835, 0.629300019, 0.633071736, 0.636830651, 0.640576433, 0.644308755, 0.648027292, 0.651731727,
    0.655421742, 0.659097026, 0.662757273, 0.666402179, 0.670031446, 0.67364478, 0.67724189, 0.680822491, 0.684386303, 0.687933051,
    0.691462461, 0.694974269, 0.698468212, 0.701944035, 0.705401484, 0.708840313, 0.712260281, 0.715661151, 0.719042691, 0.722404675,
    0.725746882, 0.729069096, 0.732371107, 0.735652708, 0.7389137, 0.742153889, 0.745373085, 0.748571105, 0.75174777, 0.754902906,
    0.758036348, 0.761147932, 0.764237502, 0.767304908, 0.770350003, 0.773372648, 0.776372708, 0.779350054, 0.782304562, 0.785236116,
    0.788144601, 0.791029912, 0.793891946, 0.796730608, 0.799545807, 0.802337457, 0.805105479, 0.807849798, 0.810570345, 0.813267057,
    0.815939875, 0.818588745, 0.82121362, 0.823814458, 0.82639122, 0.828943874, 0.831472393, 0.833976754, 0.836456941, 0.83891294,
    0.841344746, 0.843752355, 0.84613577, 0.848494997, 0.85083005, 0.853140944, 0.8554277, 0.857690346, 0.85992891, 0.862143428,
    0.864333939, 0.866500487, 0.868643119, 0.870761888, 0.872856849, 0.874928064, 0.876975597, 0.878999516, 0.880999893, 0.882976804,
    0.88493033, 0.886860554, 0.888767563, 0.890651448, 0.892512303, 0.894350226, 0.896165319, 0.897957685, 0.899727432, 0.901474671,
    0.903199515, 0.904902082, 0.906582491, 0.908240864, 0.909877328, 0.911492009, 0.913085038, 0.914656549, 0.916206678, 0.917735561,
    0.919243341, 0.920730159, 0.922196159, 0.92364149, 0.9250663, 0.92647074, 0.927854963, 0.929219123, 0.930563377, 0.931887882,
    0.933192799, 0.934478288, 0.935744512, 0.936991636, 0.938219823, 0.939429242, 0.940620059, 0.941792444, 0.942946567, 0.944082597,
    0.945200708, 0.946301072, 0.947383862, 0.948449252, 0.949497417, 0.950528532, 0.951542774, 0.952540318, 0.953521342, 0.954486023,
    0.955434537, 0.956367063, 0.957283779, 0.958184862, 0.959070491, 0.959940843, 0.960796097, 0.96163643, 0.96246202, 0.963273044,
    0.964069681, 0.964852106, 0.965620498, 0.966375031, 0.967115881, 0.967843225, 0.968557237, 0.969258091, 0.969945961, 0.97062102,
    0.97128344, 0.971933393, 0.97257105, 0.973196581, 0.973810155, 0.97441194, 0.975002105, 0.975580815, 0.976148236, 0.976704532,
    0.977249868, 0.977784406, 0.978308306, 0.97882173, 0.979324837, 0.979817785, 0.98030073, 0.980773828, 0.981237234, 0.9816911,
    0.982135579, 0.982570822, 0.982996977, 0.983414193, 0.983822617, 0.984222393, 0.984613665, 0.984996577, 0.985371269, 0.985737882,
    0.986096552, 0.986447419, 0.986790616, 0.987126279, 0.987454539, 0.987775527, 0.988089375, 0.988396208, 0.988696156, 0.988989342,
    0.98927589, 0.989555923, 0.989829561, 0.990096924, 0.99035813, 0.990613294, 0.990862532, 0.991105957, 0.991343681, 0.991575814,
    0.991802464, 0.99202374, 0.992239746, 0.992450589, 0.992656369, 0.992857189, 0.993053149, 0.993244347, 0.993430881, 0.993612845,
    0.993790335, 0.993963442, 0.994132258, 0.994296874, 0.994457377, 0.994613854, 0.994766392, 0.994915074, 0.995059984, 0.995201203,
    0.995338812, 0.995472889, 0.995603512, 0.995730757, 0.995854699, 0.995975411, 0.996092967, 0.996207438, 0.996318892, 0.996427399,
    0.996533026, 0.99663584, 0.996735904, 0.996833284, 0.996928041, 0.997020237, 0.997109932, 0.997197185, 0.997282055, 0.997364598,
    0.99744487, 0.997522925, 0.997598818, 0.9976726, 0.997744323, 0.997814039, 0.997881795, 0.997947641, 0.998011624, 0.998073791,
    0.998134187, 0.998192856, 0.998249843, 0.99830519, 0.998358939, 0.99841113, 0.998461805, 0.998511001, 0.998558758, 0.998605113,
    0.998650102, 0.998693762, 0.998736127, 0.998777231, 0.998817109, 0.998855793, 0.998893315, 0.998929706, 0.998964997, 0.998999218
  ]

  /**
   * 查询正态分布表
   * @param index
   */
  export function get_gaussian_distribution_table(index: number) {
    var index = Math.abs(index);
    if (index >= 0 && index < 4) {
      return gaussian_table[Math.floor(index * 100) / 100];
    }
    else {
      return 0;
    }
  }

  /**
   * 查询正态分布表
   * @param index
   */
  export function get_gaussian_distribution_table_reverse(rate: number) {
    var use_rate = rate;
    if (rate < 0.5) {
      use_rate = 1 - rate;
    }

    var out_index = gaussian_rate_find(use_rate) / 100 * 4;
    if (rate < 0.5) {
      return -out_index;
    }

    return out_index;
  }

  function gaussian_rate_find(v: number) {
    var Ia = 0, Ib = gaussian_table.length - 1;
    // 判断头
    if (gaussian_table[Ia] == v) {
      return Ia;
    }

    // 判断尾
    if (gaussian_table[Ib] <= v) {
      return Ib;
    }


    while (true) {
      if (Ia == Ib || Ia + 1 == Ib) {
        return Ia;
      }

      var Ic = Math.floor((Ia + Ib) / 2);
      var gv = gaussian_table[Ic];
      if (gv == v) {
        return Ic;
      }
      else if (gv < v) {
        Ia = Ic;
      }
      else if (gv > v) {
        Ib = Ic;
      }
    }
  }

  export function stdev(...args: number[]) {
    if (args.length <= 1) {
      return 0;
    }

    var total_score: number = 0;
    for (var i = 0; i < args.length; i++) {
      total_score += args[i];
    }

    var per_socre = total_score / args.length;

    var total_diff_x: number = 0;

    for (var i = 0; i < args.length; i++) {
      total_diff_x += (args[i] - per_socre) * (args[i] - per_socre);
    }

    return Math.sqrt(total_diff_x / (args.length - 1));
  }
}
export function Handle(caller: any, cb: Function, ...args) {
  if (typeof cb != 'function' && typeof caller == 'function') {
    return caller;
  }
  return cb.bind(caller, ...args);
}


export interface if_sys_ {
  plt: string,
  serverid: string,
}

// 判断文件是否指定的类型
export function is_filetype(filename, types) {
  types = types.split(',');
  var pattern = '\.(';
  for (var i = 0; i < types.length; i++) {
    if (0 != i) {
      pattern += '|';
    }
    pattern += types[i].trim();
  }
  pattern += ')$';
  return new RegExp(pattern, 'i').test(filename);
}

// 删除文件的指定后缀
export function del_filetype(filename, types) {
  types = types.split(',');
  var pattern = '\.(';
  for (var i = 0; i < types.length; i++) {
    if (0 != i) {
      pattern += '|';
    }
    pattern += types[i].trim();
  }
  pattern += ')$';

  return filename.replace(new RegExp(pattern, 'i'), '');
}

export class TeRandom {
  private _seed = 5;
  static DEFAULT_SEED = 6364;
  constructor(seed: number = Math.random()) {
    this._seed = seed;
  }

  public reset(seed: number) {
    this._seed = seed;
  }

  get seed() {
    return this._seed;
  }

  public random(min?, max?, msg: string = "") {
    max = (max == undefined) ? 1 : max;
    min = (min == undefined) ? 0 : min;

    this._seed = (this._seed * 9301 + 49297) % 233280;
    var rnd = this._seed / 233280.0;
    // console.log(gMain.iGameTime,this._seed,min,max,min + rnd * (max - min),msg);
    return min + rnd * (max - min);
  };

  public randInt(max?, min?, msg: string = "") {
    return Math.floor(this.random(max, min, msg));
  }
}
