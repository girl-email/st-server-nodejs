import {TeMap,} from './../utils/teTools';

/**
 * 客户端用户数据池
 */
class ClientUser {
    /**
     * 客户端用户MAP
     * @private
     */
    private serverIDMap = new TeMap()

    constructor() {
        setInterval(() => {
            this.updateUserHeart()
        }, 1000 * 30)
    }

    private updateUserHeart() {
        // for(const  user = )
    }

    get userList() {
        return this.serverIDMap._data
    }

    public addUser(socketId, data = {}) {
        // @ts-ignore
        this.serverIDMap.set(socketId, data)
    }

    public hasUser(socketId) {
        return this.serverIDMap.get(socketId)
    }

    public delUser(socketId) {
        return this.serverIDMap.del(socketId)
    }
}

export default new ClientUser()
