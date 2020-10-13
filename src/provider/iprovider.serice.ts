interface IProvider {
    getLink(camera): Promise<any>;
    getStatus(camera): Promise<any>;
    getConfig(camera): Promise<any>;
    setConfigItem(camera,item_id,item_value): Promise<any>;
}