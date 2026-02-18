package com.example.procurement.mapper;

import com.example.procurement.entity.ExchangeRate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import java.math.BigDecimal;

import java.util.List;

@Mapper
public interface ExchangeRateMapper {
    @Select("SELECT rate FROM exchange_rate WHERE source_currency = #{source} AND target_currency = #{target} ORDER BY effective_date DESC LIMIT 1")
    BigDecimal findLatestRate(@Param("source") String source, @Param("target") String target);

    @Select("SELECT * FROM exchange_rate ORDER BY effective_date DESC")
    List<ExchangeRate> findAll();
}
