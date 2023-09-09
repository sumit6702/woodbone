const pagination = (req,sortedProducts) => {
    const totalProducts = sortedProducts.length;    
    const currentPage = parseInt(req.query.page) || 1;
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const items = sortedProducts.slice(skip, skip + ITEMS_PER_PAGE);
  
    return {
      totalProducts,
      currentPage,
      totalPages,
      itemsPerPage: ITEMS_PER_PAGE,
      items,
    };
  };

export default pagination;
