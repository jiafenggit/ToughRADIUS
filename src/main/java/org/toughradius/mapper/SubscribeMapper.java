package org.toughradius.mapper;

import org.toughradius.entity.Subscribe;
import org.toughradius.entity.SubscribeBill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import org.toughradius.entity.SubscribeQuery;

import java.math.BigInteger;
import java.util.List;


@Repository
@Mapper
public interface SubscribeMapper {
	
	SubscribeBill fetchSubscribeBill(String username);

	Subscribe findSubscribe(@Param(value = "username") String username);

	Subscribe findById(Integer id);

	List<Subscribe> findLastUpdateUser(@Param(value = "lastUpdate") String lastUpdate);

	List<Subscribe> queryForList(SubscribeQuery subscribe);

	Integer queryTotal(SubscribeQuery subscribe);

	void insertSubscribe(Subscribe subscribe);

	void updateSubscribe(Subscribe subscribe);

	void deleteById(Integer id);

	List<String> findAllUsername();

	int updateFlowAmountByUsername(@Param(value = "username") String username, @Param(value = "flowAmount") BigInteger flowAmount);

	 int updateMacAddr(@Param(value = "username") String username, @Param(value = "macAddr") String macAddr);

	 int updateInValn(@Param(value = "username") String username, @Param(value = "inValn") Integer inValn);

	 int updateOutValn(@Param(value = "username") String username, @Param(value = "outValn") Integer outValn);

	int updateOnlineStatus(@Param(value = "username") String username, @Param(value = "status") Integer status);


}
