var entities = {}; // uses a centralized dictionary as fields of OverflowGateEntity are private
function convert(entity) {
    if (entities[entity.id] == undefined) {
        entities[entity.id] = {lastItem: null, lastInput: null, time: null, items: entity.items}
    }
    return entities[entity.id]
}
const invertedOverflowGate = extendContent(OverflowGate, "inverted-overflow-gate", {
    removeStack(tile, item, amount){
        var entity = convert(tile.ent());
        var result = Block.removeStack(tile, item, amount);
        if(result != 0 && item == entity.lastItem){
            entity.lastItem = null;
        }
        return result;
    },
    acceptItem(item, tile, source){
        var entity = convert(tile.ent());

        return tile.getTeam() == source.getTeam() && entity.lastItem === null && entity.items.total() == 0;
    },
    handleItem(item, tile, source){
        var entity = convert(tile.ent());
        entity.items.add(item, 1);
        entity.lastItem = item;
        entity.time = 0;
        entity.lastInput = source;
    },

    update(tile) {
        var entity = convert(tile.ent());
        if (entity.lastItem === null && entity.items.total() > 0) {
            entity.items.clear();
        }
        var getTivarargetAndFlip = (tile, item, src) => {
            var incomingDirection = tile.relativeTo(src.x, src.y);
            if (incomingDirection === -1) return null;

            var outputCandidates = [[1,3,2], [3,1,2]][tile.rotation() % 2]
               .map((dir) => tile.getNearby((incomingDirection + dir) % 4));
               
            var output = outputCandidates
                .filter((t) => t !== null)
                .filter((t) => !(t.block() instanceof OverflowGate))
                .filter((t) => t.block().acceptItem(item, t, tile))
                [0];
            if (output === undefined) return null;
            
            if (output === outputCandidates[0]) {
                tile.rotation((!tile.rotation())|0);
            }
            return output;
        }
        if(entity.lastItem !== null){
            var target = getTivarargetAndFlip(tile, entity.lastItem, entity.lastInput, true);
            if (target === null) return
            
            target.block().handleItem(entity.lastItem, target, tile);
            entity.items.remove(entity.lastItem, 1);
            entity.lastItem = null;
        }
    }
})
