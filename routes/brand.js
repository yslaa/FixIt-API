const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { verifyJWT, authorizeRoles } = require("../middleware/verifyJWT");
const { METHOD, PATH, ROLE } = require("../constants/index");

// router.use(verifyJWT);

const brandRoutes = [
  {
    method: METHOD.GET,
    path: PATH.BRANDS,
    // roles: [ROLE.ADMIN, ROLE.EMPLOYEE],
    handler: brandController.getAllBrands,
  },
  {
    method: METHOD.POST,
    path: PATH.BRANDS,
    // roles: [ROLE.ADMIN],
    handler: brandController.createNewBrand,
  },
  {
    method: METHOD.GET,
    path: PATH.BRAND_ID,
    // roles: [ROLE.ADMIN, ROLE.EMPLOYEE],
    handler: brandController.getSingleBrand,
  },
  {
    method: METHOD.PATCH,
    path: PATH.EDIT_BRAND_ID,
    // roles: [ROLE.ADMIN],
    handler: brandController.updateBrand,
  },
  {
    method: METHOD.DELETE,
    path: PATH.BRAND_ID,
    // roles: [ROLE.ADMIN],
    handler: brandController.deleteBrand,
  },
];

brandRoutes.forEach((route) => {
  const { method, path, roles, handler } = route;
  router[method](path,
    handler,  
    // authorizeRoles(...roles)
    );
});

module.exports = router;
