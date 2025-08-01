import { ERC20 } from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract DummyToken is ERC20 {
    constructor() ERC20("DummyToken", "DTK") {
        _mint(msg.sender, 1_00_000_000 * (10**uint256(decimals())));
    }

    function claim() public returns (bool) {
        _mint(msg.sender, 10 * (10**uint256(decimals())));
        return true;
    }
}